import { z } from "zod";

export const severidadEnum = z.enum(["Leve", "Moderada", "Grave"]);

export const idParamSchema = z.object({
  id: z.uuid({ message: "id debe ser un UUID válido" }),
});

export const patientIdParamSchema = z.object({
  patientId: z.uuid({ message: "patientId debe ser un UUID válido" }),
});

export const patientAndSustanciaParamSchema = z.object({
  patientId: z.uuid({ message: "patientId debe ser un UUID válido" }),
  sustancia: z
    .string()
    .min(1, "sustancia es requerida")
    .max(256, "sustancia no puede exceder 256 caracteres"),
});

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  page: z.coerce.number().int().positive().optional().default(1),
});

export const createAllergySchema = z.object({
  patientId: z.uuid({ message: "patientId debe ser un UUID válido" }),
  sustancia: z
    .string()
    .min(1, "sustancia es requerida")
    .max(256, "sustancia no puede exceder 256 caracteres"),
  severidad: severidadEnum,
  reaccion: z
    .string()
    .max(512, "reaccion no puede exceder 512 caracteres")
    .optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateAllergySchema = createAllergySchema
  .omit({ patientId: true })
  .partial();