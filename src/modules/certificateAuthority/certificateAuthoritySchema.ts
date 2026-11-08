import { z } from "zod";

const uuid = z.uuid("Debe ser un UUID válido");

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export const createCertificateAuthoritySchema = z.object({
  nombre: z.string().trim().min(1).max(256),
  certificadoRaiz: z.string().trim().min(1, "El certificado raíz PEM es obligatorio"),
  crlEndpoint: z.url("Debe ser una URL válida").max(512).optional(),
  ocspEndpoint: z.url("Debe ser una URL válida").max(512).optional(),
});

export const registerDoctorCertificateSchema = z.object({
  doctorId: uuid,
  caId: uuid,
  certificadoPublico: z.string().trim().min(1, "El certificado público PEM es obligatorio"),
});

export const revokeDoctorCertificateSchema = z.object({
  motivoRevocacion: z.string().trim().min(1).max(256),
});

export const idParamSchema = z.object({ id: uuid });
export const doctorIdParamSchema = z.object({ doctorId: uuid });

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type CreateCertificateAuthorityInput = z.infer<typeof createCertificateAuthoritySchema>;
export type RegisterDoctorCertificateInput = z.infer<typeof registerDoctorCertificateSchema>;
export type RevokeDoctorCertificateInput = z.infer<typeof revokeDoctorCertificateSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type DoctorIdParam = z.infer<typeof doctorIdParamSchema>;