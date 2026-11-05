import { createHash, createVerify, verify as cryptoVerify, X509Certificate } from "node:crypto";
import { ForbiddenException, InvalidInputException } from "../../utils/exceptions";
import {
  annulPrescription,
  createPrescription,
  createSignatureVerification,
  deleteDraftPrescription,
  getAppointmentForPrescription,
  getCertificateWithCaById,
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
import type { CreatePrescriptionInput, SignPrescriptionInput, UpdatePrescriptionInput } from "./prescriptionSchema";

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
): { valid: boolean; reason?: string } {
  let doctorX509: X509Certificate;
  let caX509: X509Certificate;

  try {
    doctorX509 = new X509Certificate(certificadoPublicoPem);
    caX509 = new X509Certificate(certificadoRaizCaPem);
  } catch {
    return { valid: false, reason: "Formato PEM de certificado X.509 inválido." };
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

  try {
    if (algorithm === "Ed25519") {
      const isValid = cryptoVerify(null, digestBuffer, doctorX509.publicKey, signatureBuffer);
      return isValid
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

    const verifier = createVerify(verifyAlgo);
    verifier.update(documentHashHex, "utf8");
    verifier.end();
    const isValid = verifier.verify(doctorX509.publicKey, signatureBuffer);

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
    throw new InvalidInputException("El paciente no coincide con el turno indicado.");
  }
  if (appointment.estado === "Cancelada") {
    throw new InvalidInputException("No se puede emitir una receta para un turno cancelado.");
  }

  return createPrescription({
    appointmentId: data.appointmentId,
    doctorId,
    patientId: data.patientId,
    observaciones: data.observaciones,
  }, data.items, doctorId);
}

export const getPrescriptionService = (id: string) => getPrescriptionById(id);

export const getPrescriptionByAppointmentService = (appointmentId: string) =>
  getPrescriptionByAppointment(appointmentId);

export async function getPrescriptionsByPatientService(
  patientId: string,
  limit: number = 20,
  page: number = 1,
) {
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
    throw new InvalidInputException(
      `Solo se pueden firmar recetas en estado "Borrador" (estado actual: "${prescription.estado}").`,
    );
  }
  if (prescription.items.length === 0) {
    throw new InvalidInputException("No se puede firmar una receta sin medicamentos.");
  }

  const { documentHash: expectedHash } = computePrescriptionHash(prescription, prescription.items);
  if (data.documentHash.toLowerCase() !== expectedHash.toLowerCase()) {
    throw new InvalidInputException(
      "El documentHash proporcionado no coincide con el hash canónico SHA-256 de la receta.",
    );
  }

  const certRecord = await getCertificateWithCaById(data.certificateId);
  if (!certRecord || certRecord.certificate.doctorId !== doctorId) {
    throw new InvalidInputException("El certificado no existe o no pertenece al médico.");
  }

  const now = new Date();
  const { certificate, ca } = certRecord;

  if (certificate.revokedAt) {
    throw new InvalidInputException("El certificado del médico se encuentra revocado.");
  }
  if (certificate.validoDesde > now || certificate.validoHasta < now) {
    throw new InvalidInputException("El certificado del médico no está vigente.");
  }
  if (ca.validoDesde > now || ca.validoHasta < now) {
    throw new InvalidInputException("El certificado de la Autoridad Certificadora no está vigente.");
  }

  const cryptoCheck = verifyCryptographicSignature(
    certificate.certificadoPublico,
    ca.certificadoRaiz,
    expectedHash,
    data.signature,
    data.signatureAlgorithm,
  );

  if (!cryptoCheck.valid) {
    throw new InvalidInputException(cryptoCheck.reason ?? "Firma digital inválida.");
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
  );
}

export async function verifyPrescriptionSignatureService(
  id: string,
  userId?: string,
  ipOrigen?: string,
): Promise<SignatureVerification> {
  const prescription = await getPrescriptionById(id);

  if (prescription.estado === "Borrador") {
    throw new InvalidInputException("La receta aún está en estado Borrador y no posee firma digital.");
  }

  let resultado: "Valida" | "Invalida" | "CertificadoExpirado" | "Revocado" = "Valida";
  let detalle = "Firma digital e integridad del documento verificadas correctamente.";

  if (
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
      );
      if (!cryptoCheck.valid) {
        resultado = "Invalida";
        detalle = cryptoCheck.reason ?? "La verificación criptográfica de la firma falló.";
      }
    }
  }

  return createSignatureVerification({
    prescriptionId: id,
    verificadoPorUserId: userId,
    resultado,
    detalle,
    ipOrigen,
  });
}

export async function annulPrescriptionService(id: string, doctorId: string, motivo: string) {
  return annulPrescription(id, doctorId, motivo, doctorId);
}
