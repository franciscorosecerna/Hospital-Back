import type { ValidatedContext } from "../../utils/validator";
import type {
  CreateCertificateAuthorityInput,
  DoctorIdParam,
  IdParam,
  PaginationQuery,
  RegisterDoctorCertificateInput,
  RevokeDoctorCertificateInput,
} from "./certificateAuthoritySchema";
import {
  createCertificateAuthorityService,
  getCertificateAuthorityService,
  getDoctorCertificateService,
  listCertificateAuthoritiesService,
  listCertificatesByDoctorService,
  registerDoctorCertificateService,
  revokeDoctorCertificateService,
} from "./certificateAuthorityService";

export async function listCertificateAuthorities(c: ValidatedContext<unknown, unknown, PaginationQuery>) {
  const { limit, page } = c.req.valid("query");
  const authorities = await listCertificateAuthoritiesService(limit, page);
  return c.json(authorities);
}

export async function getCertificateAuthority(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const authority = await getCertificateAuthorityService(id);
  return c.json(authority);
}

export async function createCertificateAuthority(c: ValidatedContext<CreateCertificateAuthorityInput>) {
  const input = c.req.valid("json");
  const created = await createCertificateAuthorityService(input, c.get("user").sub);
  return c.json(created, 201);
}

export async function getDoctorCertificate(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const certificate = await getDoctorCertificateService(id);
  return c.json(certificate);
}

export async function listCertificatesByDoctor(c: ValidatedContext<unknown, DoctorIdParam, PaginationQuery>) {
  const { doctorId } = c.req.valid("param");
  const { limit, page } = c.req.valid("query");
  const certificates = await listCertificatesByDoctorService(doctorId, limit, page);
  return c.json(certificates);
}

export async function registerDoctorCertificate(c: ValidatedContext<RegisterDoctorCertificateInput>) {
  const input = c.req.valid("json");
  const created = await registerDoctorCertificateService(input, c.get("user"));
  return c.json(created, 201);
}

export async function revokeDoctorCertificate(c: ValidatedContext<RevokeDoctorCertificateInput, IdParam>) {
  const { id } = c.req.valid("param");
  const { motivoRevocacion } = c.req.valid("json");
  const revoked = await revokeDoctorCertificateService(id, motivoRevocacion, c.get("user"));
  return c.json(revoked);
}