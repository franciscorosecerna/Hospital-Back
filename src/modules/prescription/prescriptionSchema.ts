import { z } from "zod";

const uuid = z.uuid("Debe ser un UUID válido");

export const ALLOWED_SIGNATURE_ALGORITHMS = [
  "RSA-SHA256",
  "RSA-SHA384",
  "RSA-SHA512",
  "ECDSA-SHA256",
  "ECDSA-SHA384",
  "Ed25519",
] as const;

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

const itemSchema = z.object({
  medicationId: uuid,
  dosis: z.string().trim().min(1).max(128),
  frecuencia: z.string().trim().min(1).max(128),
  duracion: z.string().trim().min(1).max(128),
  indicaciones: z.string().trim().max(512).optional(),
});

const itemsArraySchema = z
  .array(itemSchema)
  .min(1, "Debe incluir al menos un medicamento")
  .refine(
    (items) => new Set(items.map((i) => i.medicationId)).size === items.length,
    { message: "No se permiten medicamentos duplicados en la misma receta" },
  );

export const createPrescriptionSchema = z.object({
  appointmentId: uuid,
  patientId: uuid,
  observaciones: z.string().trim().max(1024).optional(),
  items: itemsArraySchema,
});

export const updatePrescriptionSchema = z.object({
  observaciones: z.string().trim().max(1024).nullable().optional(),
  items: itemsArraySchema.optional(),
}).refine((value) => Object.values(value).some((field) => field !== undefined), {
  message: "Debe enviar al menos un campo para actualizar",
});

export const signPrescriptionSchema = z.object({
  certificateId: uuid,
  documentHash: z.string().trim().regex(/^[a-fA-F0-9]{64}$/, "El hash del documento debe ser un SHA-256 en hexadecimal (64 caracteres)"),
  signature: z.string().trim().min(1),
  signatureAlgorithm: z.enum(ALLOWED_SIGNATURE_ALGORITHMS),
});

export const annulPrescriptionSchema = z.object({
  motivoAnulacion: z.string().trim().min(1).max(512),
});

export const publicVerifyPrescriptionSchema = z.object({
  documentHash: z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{64}$/, "El hash del documento debe ser un SHA-256 en hexadecimal (64 caracteres)"),
});

export const idParamSchema = z.object({ id: uuid });
export const appointmentIdParamSchema = z.object({ appointmentId: uuid });
export const patientIdParamSchema = z.object({ patientId: uuid });
export const doctorIdParamSchema = z.object({ doctorId: uuid });

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
export type UpdatePrescriptionInput = z.infer<typeof updatePrescriptionSchema>;
export type SignPrescriptionInput = z.infer<typeof signPrescriptionSchema>;
export type AnnulPrescriptionInput = z.infer<typeof annulPrescriptionSchema>;
export type PublicVerifyPrescriptionInput = z.infer<typeof publicVerifyPrescriptionSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type AppointmentIdParam = z.infer<typeof appointmentIdParamSchema>;
export type PatientIdParam = z.infer<typeof patientIdParamSchema>;
export type DoctorIdParam = z.infer<typeof doctorIdParamSchema>;