import { createHash, createVerify, timingSafeEqual, verify as cryptoVerify, X509Certificate } from "node:crypto";
import { BusinessRuleException, ConflictStateException, ForbiddenException } from "../../utils/exceptions";
import type { TokenPayload } from "../authorization/authorizationService";
import { getCertificateWithCaById } from "../certificateAuthority/certificateAuthorityRepository";
import {
  annulPrescription,
  createPrescription,
  createSignatureVerification,
  deleteDraftPrescription,
  getAppointmentForPrescription,
  getPrescriptionByAppointment,
  getPrescriptionById,
  getPrescriptionsByDoctor,
  getPrescriptionsByPatient,
  signPrescription,
  updateDraftPrescription,
  type Prescription,
  type PrescriptionItem,
  type SignatureVerification,
} from "./prescriptionRepository";
import type {
  CreatePrescriptionInput,
  PublicVerifyPrescriptionInput,
  SignPrescriptionInput,
  UpdatePrescriptionInput,
} from "./prescriptionSchema";

const CLINICAL_STAFF_ROLES = ["admin", "doctor", "nurse"];

function assertCanAccessPatientPrescription(requester: TokenPayload, targetPatientId: string): void {
  const isStaff = requester.roles.some((role) => CLINICAL_STAFF_ROLES.includes(role));
  if (!isStaff && requester.sub !== targetPatientId) {
    throw new ForbiddenException("No tiene permiso para acceder a las recetas de otro paciente.");
  }
}

export function buildCanonicalPrescriptionPayload(
  prescription: Pick<Prescription, "id" | "appointmentId" | "doctorId" | "patientId" | "fechaEmision" | "observaciones">,
  items: Pick<PrescriptionItem, "medicationId" | "dosis" | "frecuencia" | "duracion" | "indicaciones">[],
): string {
  const sortedItems = [...items]
    .sort((a, b) => a.medicationId.localeCompare(b.medicationId))
    .map((item) => ({
      medicationId: item.medicationId,
      dosis: item.dosis,
      frecuencia: item.frecuencia,
      duracion: item.duracion,
      indicaciones: item.indicaciones ?? null,
    }));

  return JSON.stringify({
    id: prescription.id,
    appointmentId: prescription.appointmentId,
    doctorId: prescription.doctorId,
    patientId: prescription.patientId,
    fechaEmision: prescription.fechaEmision.toISOString(),
    observaciones: prescription.observaciones ?? null,
    items: sortedItems,
  });
}

export function computePrescriptionHash(
  prescription: Pick<Prescription, "id" | "appointmentId" | "doctorId" | "patientId" | "fechaEmision" | "observaciones">,
  items: Pick<PrescriptionItem, "medicationId" | "dosis" | "frecuencia" | "duracion" | "indicaciones">[],
): { canonicalPayload: string; documentHash: string } {
  const canonicalPayload = buildCanonicalPrescriptionPayload(prescription, items);
  const documentHash = createHash("sha256").update(canonicalPayload, "utf8").digest("hex");
  return { canonicalPayload, documentHash };
}

function verifyCryptographicSignature(
  certificadoPublicoPem: string,
  certificadoRaizCaPem: string,
  documentHashHex: string,
  signatureBase64: string,
  algorithm: string,
  evaluationTime: Date,
): { valid: boolean; expired?: boolean; reason?: string } {
  let doctorX509: X509Certificate;
  let caX509: X509Certificate;

  try {
    doctorX509 = new X509Certificate(certificadoPublicoPem);
    caX509 = new X509Certificate(certificadoRaizCaPem);
  } catch {
    return { valid: false, reason: "Formato PEM de certificado X.509 inválido." };
  }

  if (!caX509.ca) {
    return { valid: false, reason: "El certificado raíz proporcionado no corresponde a una Autoridad Certificadora (basicConstraints CA=false)." };
  }

  const doctorValidFrom = new Date(doctorX509.validFrom);
  const doctorValidTo = new Date(doctorX509.validTo);
  const caValidFrom = new Date(caX509.validFrom);
  const caValidTo = new Date(caX509.validTo);

  if (
    evaluationTime < doctorValidFrom ||
    evaluationTime > doctorValidTo ||
    evaluationTime < caValidFrom ||
    evaluationTime > caValidTo
  ) {
    return {
      valid: false,
      expired: true,
      reason: "El certificado X.509 del médico o de la Autoridad Certificadora no se encuentra dentro de su período de validez.",
    };
  }

  try {
    const issuedByCa = doctorX509.verify(caX509.publicKey);
    if (!issuedByCa) {
      return { valid: false, reason: "El certificado del médico no fue firmado por la Autoridad Certificadora indicada." };
    }
  } catch {
    return { valid: false, reason: "Error al verificar la cadena de confianza con la Autoridad Certificadora." };
  }

  const signatureBuffer = Buffer.from(signatureBase64, "base64");
  const digestBuffer = Buffer.from(documentHashHex, "hex");
  const hexUtf8Buffer = Buffer.from(documentHashHex, "utf8");

  try {
    if (algorithm === "Ed25519") {
      const isValidRaw = cryptoVerify(null, digestBuffer, doctorX509.publicKey, signatureBuffer);
      const isValidHexUtf8 = isValidRaw || cryptoVerify(null, hexUtf8Buffer, doctorX509.publicKey, signatureBuffer);
      return isValidHexUtf8
        ? { valid: true }
        : { valid: false, reason: "La firma criptográfica Ed25519 no es válida para el hash del documento." };
    }

    const nodeDigestMap: Record<string, string> = {
      "RSA-SHA256": "RSA-SHA256",
      "RSA-SHA384": "RSA-SHA384",
      "RSA-SHA512": "RSA-SHA512",
      "ECDSA-SHA256": "sha256",
      "ECDSA-SHA384": "sha384",
    };

    const verifyAlgo = nodeDigestMap[algorithm];
    if (!verifyAlgo) {
      return { valid: false, reason: `Algoritmo de firma no soportado: ${algorithm}` };
    }

    const verifyWithPayload = (payload: Buffer) => {
      const verifier = createVerify(verifyAlgo);
      verifier.update(payload);
      verifier.end();
      return verifier.verify(doctorX509.publicKey, signatureBuffer);
    };

    const isValid = verifyWithPayload(digestBuffer) || verifyWithPayload(hexUtf8Buffer);

    return isValid
      ? { valid: true }
      : { valid: false, reason: "La firma criptográfica no coincide con la clave pública del médico y el hash del documento." };
  } catch {
    return { valid: false, reason: "Error al evaluar la firma criptográfica." };
  }
}

export async function createPrescriptionService(
  doctorId: string,
  data: CreatePrescriptionInput,
) {
  const appointment = await getAppointmentForPrescription(data.appointmentId);
  if (appointment.doctorId !== doctorId) {
    throw new ForbiddenException("Solo el médico asignado al turno puede emitir una receta para este turno.");
  }
  if (appointment.patientId !== data.patientId) {
    throw new BusinessRuleException("El paciente no coincide con el turno indicado.");
  }
  if (appointment.estado === "Cancelada") {
    throw new ConflictStateException("No se puede emitir una receta para un turno cancelado.");
  }

  return createPrescription({
    appointmentId: data.appointmentId,
    doctorId,
    patientId: data.patientId,
    observaciones: data.observaciones,
  }, data.items, doctorId);
}

export async function getPrescriptionService(id: string, requester: TokenPayload) {
  const prescription = await getPrescriptionById(id);
  assertCanAccessPatientPrescription(requester, prescription.patientId);
  return prescription;
}

export async function getPrescriptionByAppointmentService(appointmentId: string, requester: TokenPayload) {
  const prescription = await getPrescriptionByAppointment(appointmentId);
  assertCanAccessPatientPrescription(requester, prescription.patientId);
  return prescription;
}

export async function getPrescriptionsByPatientService(
  patientId: string,
  requester: TokenPayload,
  limit: number = 20,
  page: number = 1,
) {
  assertCanAccessPatientPrescription(requester, patientId);
  const offset = (page - 1) * limit;
  return getPrescriptionsByPatient(patientId, limit, offset);
}

export async function getPrescriptionsByDoctorService(
  doctorId: string,
  limit: number = 20,
  page: number = 1,
) {
  const offset = (page - 1) * limit;
  return getPrescriptionsByDoctor(doctorId, limit, offset);
}

export async function getPrescriptionHashService(id: string, doctorId: string) {
  const prescription = await getPrescriptionById(id);
  if (prescription.doctorId !== doctorId) {
    throw new ForbiddenException("No tiene permiso para acceder al hash de firma de esta receta.");
  }
  const { canonicalPayload, documentHash } = computePrescriptionHash(prescription, prescription.items);
  return {
    prescriptionId: prescription.id,
    estado: prescription.estado,
    documentHash,
    canonicalPayload,
  };
}

export async function updatePrescriptionService(
  id: string,
  doctorId: string,
  data: UpdatePrescriptionInput,
) {
  return updateDraftPrescription(id, doctorId, { observaciones: data.observaciones }, data.items, doctorId);
}

export async function deletePrescriptionService(id: string, doctorId: string) {
  return deleteDraftPrescription(id, doctorId, doctorId);
}

export async function signPrescriptionService(
  id: string,
  doctorId: string,
  data: SignPrescriptionInput,
) {
  const prescription = await getPrescriptionById(id);
  if (prescription.doctorId !== doctorId) {
    throw new ForbiddenException("No tiene permiso para firmar una receta emitida por otro médico.");
  }
  if (prescription.estado !== "Borrador") {
    throw new ConflictStateException(
      `Solo se pueden firmar recetas en estado "Borrador" (estado actual: "${prescription.estado}").`,
    );
  }
  if (prescription.items.length === 0) {
    throw new BusinessRuleException("No se puede firmar una receta sin medicamentos.");
  }

  const { documentHash: expectedHash } = computePrescriptionHash(prescription, prescription.items);
  if (data.documentHash.toLowerCase() !== expectedHash.toLowerCase()) {
    throw new BusinessRuleException(
      "El documentHash proporcionado no coincide con el hash canónico SHA-256 de la receta.",
    );
  }

  const certRecord = await getCertificateWithCaById(data.certificateId);
  if (!certRecord || certRecord.certificate.doctorId !== doctorId) {
    throw new BusinessRuleException("El certificado no existe o no pertenece al médico.");
  }

  const now = new Date();
  const { certificate, ca } = certRecord;

  if (certificate.revokedAt) {
    throw new BusinessRuleException("El certificado del médico se encuentra revocado.");
  }
  if (certificate.validoDesde > now || certificate.validoHasta < now) {
    throw new BusinessRuleException("El certificado del médico no está vigente.");
  }
  if (ca.validoDesde > now || ca.validoHasta < now) {
    throw new BusinessRuleException("El certificado de la Autoridad Certificadora no está vigente.");
  }

  const cryptoCheck = verifyCryptographicSignature(
    certificate.certificadoPublico,
    ca.certificadoRaiz,
    expectedHash,
    data.signature,
    data.signatureAlgorithm,
    now,
  );

  if (!cryptoCheck.valid) {
    throw new BusinessRuleException(cryptoCheck.reason ?? "Firma digital inválida.");
  }

  return signPrescription(
    id,
    doctorId,
    {
      certificateId: data.certificateId,
      documentHash: expectedHash,
      signature: data.signature,
      signatureAlgorithm: data.signatureAlgorithm,
      firmadaAt: now,
    },
    doctorId,
    (lockedPrescription, lockedItems) => computePrescriptionHash(lockedPrescription, lockedItems).documentHash,
  );
}

export async function verifyPrescriptionSignatureService(
  id: string,
  requester?: TokenPayload,
  ipOrigen?: string,
): Promise<SignatureVerification> {
  const prescription = await getPrescriptionById(id);

  if (requester) {
    assertCanAccessPatientPrescription(requester, prescription.patientId);
  }

  if (prescription.estado === "Borrador") {
    throw new ConflictStateException("La receta aún está en estado Borrador y no posee firma digital.");
  }

  let resultado: "Valida" | "Invalida" | "CertificadoExpirado" | "Revocado" = "Valida";
  let detalle = "Firma digital e integridad del documento verificadas correctamente.";

  if (prescription.estado === "Anulada") {
    resultado = "Invalida";
    detalle = `La receta se encuentra ANULADA (${prescription.motivoAnulacion ?? "sin motivo especificado"}).`;
  } else if (
    !prescription.certificateId ||
    !prescription.documentHash ||
    !prescription.signature ||
    !prescription.signatureAlgorithm ||
    !prescription.firmadaAt
  ) {
    resultado = "Invalida";
    detalle = "Faltan metadatos de firma en la receta.";
  } else {
    const certRecord = await getCertificateWithCaById(prescription.certificateId);
    const { documentHash: currentHash } = computePrescriptionHash(prescription, prescription.items);

    if (!certRecord) {
      resultado = "Invalida";
      detalle = "No se encontró el certificado digital asociado a la firma.";
    } else if (
      certRecord.certificate.revokedAt &&
      certRecord.certificate.revokedAt <= prescription.firmadaAt
    ) {
      resultado = "Revocado";
      detalle = `El certificado fue revocado (${certRecord.certificate.motivoRevocacion ?? "sin motivo especificado"}).`;
    } else if (
      prescription.firmadaAt < certRecord.certificate.validoDesde ||
      prescription.firmadaAt > certRecord.certificate.validoHasta ||
      prescription.firmadaAt < certRecord.ca.validoDesde ||
      prescription.firmadaAt > certRecord.ca.validoHasta
    ) {
      resultado = "CertificadoExpirado";
      detalle = "El certificado del médico o de la CA no estaba vigente al momento de la firma.";
    } else if (currentHash.toLowerCase() !== prescription.documentHash.toLowerCase()) {
      resultado = "Invalida";
      detalle = "El contenido de la receta fue alterado después de la firma (hash no coincide).";
    } else {
      const cryptoCheck = verifyCryptographicSignature(
        certRecord.certificate.certificadoPublico,
        certRecord.ca.certificadoRaiz,
        currentHash,
        prescription.signature,
        prescription.signatureAlgorithm,
        prescription.firmadaAt,
      );
      if (!cryptoCheck.valid) {
        resultado = cryptoCheck.expired ? "CertificadoExpirado" : "Invalida";
        detalle = cryptoCheck.reason ?? "La verificación criptográfica de la firma falló.";
      }
    }
  }

  return createSignatureVerification({
    prescriptionId: id,
    verificadoPorUserId: requester?.sub,
    resultado,
    detalle,
    ipOrigen,
  });
}

export async function verifyPrescriptionPublicService(
  id: string,
  input: PublicVerifyPrescriptionInput,
  ipOrigen?: string,
) {
  const prescription = await getPrescriptionById(id);

  if (prescription.estado === "Borrador" || !prescription.documentHash) {
    throw new ConflictStateException("La receta indicada aún no ha sido firmada digitalmente.");
  }

  const providedHashBuf = Buffer.from(input.documentHash.toLowerCase(), "hex");
  const storedHashBuf = Buffer.from(prescription.documentHash.toLowerCase(), "hex");

  const hashesMatch =
    providedHashBuf.length === storedHashBuf.length &&
    timingSafeEqual(providedHashBuf, storedHashBuf);

  if (!hashesMatch) {
    const verification = await createSignatureVerification({
      prescriptionId: id,
      verificadoPorUserId: undefined,
      resultado: "Invalida",
      detalle: "El documentHash proporcionado por el verificador externo no coincide con el registrado en la receta.",
      ipOrigen,
    });

    return {
      verification,
      prescription: null,
    };
  }

  const verification = await verifyPrescriptionSignatureService(id, undefined, ipOrigen);

  return {
    verification,
    prescription: {
      id: prescription.id,
      estado: prescription.estado,
      doctorId: prescription.doctorId,
      patientId: prescription.patientId,
      fechaEmision: prescription.fechaEmision,
      firmadaAt: prescription.firmadaAt,
      anuladaAt: prescription.anuladaAt,
      motivoAnulacion: prescription.motivoAnulacion,
      items: prescription.items.map((item) => ({
        medicationId: item.medicationId,
        dosis: item.dosis,
        frecuencia: item.frecuencia,
        duracion: item.duracion,
        indicaciones: item.indicaciones,
      })),
    },
  };
}

export async function annulPrescriptionService(id: string, doctorId: string, motivo: string) {
  return annulPrescription(id, doctorId, motivo, doctorId);
}