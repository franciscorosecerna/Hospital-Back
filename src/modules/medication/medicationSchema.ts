import { z } from "zod";

const uuid = z.uuid("Debe ser un UUID válido");

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export const medicationSearchQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(256).optional(),
});

export const createMedicationSchema = z.object({
  nombre: z.string().trim().min(1).max(256),
  descripcion: z.string().trim().max(512).optional(),
  presentacion: z.string().trim().max(128).optional(),
});

export const updateMedicationSchema = z.object({
  nombre: z.string().trim().min(1).max(256).optional(),
  descripcion: z.string().trim().max(512).nullable().optional(),
  presentacion: z.string().trim().max(128).nullable().optional(),
}).refine((value) => Object.values(value).some((field) => field !== undefined), {
  message: "Debe enviar al menos un campo para actualizar",
});

export const idParamSchema = z.object({ id: uuid });

export type MedicationSearchQuery = z.infer<typeof medicationSearchQuerySchema>;
export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;
export type IdParam = z.infer<typeof idParamSchema>;