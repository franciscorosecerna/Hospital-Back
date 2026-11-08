import { X509Certificate } from "node:crypto";
import { BusinessRuleException, ForbiddenException } from "../../utils/exceptions";
import type { TokenPayload } from "../authorization/authorizationService";
import {
  createCertificateAuthority,
  createDoctorCertificate,
  getCertificateAuthorityById,
  getDoctorCertificateById,
  listCertificateAuthorities,
  listCertificatesByDoctor,
  revokeDoctorCertificate,
} from "./certificateAuthorityRepository";
import type {
  CreateCertificateAuthorityInput,
  RegisterDoctorCertificateInput,
} from "./certificateAuthoritySchema";

export async function listCertificateAuthoritiesService(limit: number = 20, page: number = 1) {
  const offset = (page - 1) * limit;
  return listCertificateAuthorities(limit, offset);
}

export async function getCertificateAuthorityService(id: string) {
  return getCertificateAuthorityById(id);
}

export async function createCertificateAuthorityService(
  data: CreateCertificateAuthorityInput,
  performedBy: string,
) {
  let caX509: X509Certificate;
  try {
    caX509 = new X509Certificate(data.certificadoRaiz);
  } catch {
    throw new BusinessRuleException("El certificado raíz proporcionado no tiene un formato X.509 PEM válido.");
  }

  if (!caX509.ca) {
    throw new BusinessRuleException(
      "El certificado proporcionado no corresponde a una Autoridad Certificadora (basicConstraints CA=false).",
    );
  }

  const validoDesde = new Date(caX509.validFrom);
  const validoHasta = new Date(caX509.validTo);

  if (Number.isNaN(validoDesde.getTime()) || Number.isNaN(validoHasta.getTime()) || validoHasta <= new Date()) {
    throw new BusinessRuleException("El certificado raíz de la Autoridad Certificadora se encuentra expirado o posee fechas inválidas.");
  }

  return createCertificateAuthority(
    {
      nombre: data.nombre,
      certificadoRaiz: data.certificadoRaiz,
      crlEndpoint: data.crlEndpoint,
      ocspEndpoint: data.ocspEndpoint,
      validoDesde,
      validoHasta,
    },
    performedBy,
  );
}

export async function getDoctorCertificateService(id: string) {
  return getDoctorCertificateById(id);
}

export async function listCertificatesByDoctorService(doctorId: string, limit: number = 20, page: number = 1) {
  const offset = (page - 1) * limit;
  return listCertificatesByDoctor(doctorId, limit, offset);
}

export async function registerDoctorCertificateService(
  data: RegisterDoctorCertificateInput,
  requester: TokenPayload,
) {
  const isAdmin = requester.roles.includes("admin");
  if (!isAdmin && requester.sub !== data.doctorId) {
    throw new ForbiddenException("No tiene permiso para registrar certificados digitales para otro médico.");
  }

  const ca = await getCertificateAuthorityById(data.caId);

  let doctorX509: X509Certificate;
  let caX509: X509Certificate;
  try {
    doctorX509 = new X509Certificate(data.certificadoPublico);
    caX509 = new X509Certificate(ca.certificadoRaiz);
  } catch {
    throw new BusinessRuleException("El certificado público proporcionado no tiene un formato X.509 PEM válido.");
  }

  try {
    if (!doctorX509.verify(caX509.publicKey)) {
      throw new BusinessRuleException("El certificado público del médico no fue emitido por la Autoridad Certificadora indicada.");
    }
  } catch (err) {
    if (err instanceof BusinessRuleException) throw err;
    throw new BusinessRuleException("No se pudo verificar la firma de la Autoridad Certificadora sobre el certificado del médico.");
  }

  const validoDesde = new Date(doctorX509.validFrom);
  const validoHasta = new Date(doctorX509.validTo);
  if (Number.isNaN(validoDesde.getTime()) || Number.isNaN(validoHasta.getTime()) || validoHasta <= new Date()) {
    throw new BusinessRuleException("El certificado del médico se encuentra expirado o posee fechas de validez inválidas.");
  }

  const numeroSerie = doctorX509.serialNumber.trim().toUpperCase();
  if (!numeroSerie) {
    throw new BusinessRuleException("El certificado X.509 no contiene un número de serie válido.");
  }

  return createDoctorCertificate(
    {
      doctorId: data.doctorId,
      caId: data.caId,
      certificadoPublico: data.certificadoPublico,
      numeroSerie,
      validoDesde,
      validoHasta,
    },
    requester.sub,
  );
}

export async function revokeDoctorCertificateService(
  id: string,
  motivoRevocacion: string,
  requester: TokenPayload,
) {
  const cert = await getDoctorCertificateById(id);
  const isAdmin = requester.roles.includes("admin");
  if (!isAdmin && cert.doctorId !== requester.sub) {
    throw new ForbiddenException("No tiene permiso para revocar el certificado digital de otro médico.");
  }

  return revokeDoctorCertificate(id, motivoRevocacion, requester.sub);
}