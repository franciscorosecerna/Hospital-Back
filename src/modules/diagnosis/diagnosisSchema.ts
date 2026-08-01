import { z } from "zod";

export const createDiagnosisSchema = z.object({
  patientId: z.uuid({ message: "patientId debe ser un UUID válido" }),
  appointmentId: z
    .uuid({ message: "appointmentId debe ser un UUID válido" })
    .optional(),
  doctorId: z.uuid({ message: "doctorId debe ser un UUID válido" }),
  // Código CIE-10 opcional
  codigo: z
    .string()
    .max(16, { message: "codigo no puede superar 16 caracteres" })
    .optional(),
  descripcion: z
    .string()
    .min(1, { message: "descripcion es requerida" })
    .max(512, { message: "descripcion no puede superar 512 caracteres" }),
  isActive: z.boolean().optional().default(true),
});

export const updateDiagnosisSchema = createDiagnosisSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar",
  });

// Params schemas
export const idParamSchema = z.object({
  id: z.uuid({ message: "id debe ser un UUID válido" }),
});

export const appointmentIdParamSchema = z.object({
  appointmentId: z
    .uuid({ message: "appointmentId debe ser un UUID válido" }),
});

export const patientIdParamSchema = z.object({
  patientId: z.uuid({ message: "patientId debe ser un UUID válido" }),
});

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  page: z.coerce.number().int().positive().optional().default(1),
});

export type CreateDiagnosisInput = z.infer<typeof createDiagnosisSchema>;
export type UpdateDiagnosisInput = z.infer<typeof updateDiagnosisSchema>;