import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const patientIdParamSchema = z.object({
  patientId: z.string().uuid(),
});

export const doctorIdParamSchema = z.object({
  doctorId: z.string().uuid(),
});

export const appointmentIdParamSchema = z.object({
  appointmentId: z.string().uuid(),
});

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(1).default(1),
});

export const createProcedureSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  appointmentId: z.string().uuid().nullish(),
  nombre: z.string().trim().min(1).max(256),
  descripcion: z.string().trim().max(1024).nullish(),
  fechaHora: z.coerce.date(),
  resultado: z.string().trim().max(512).nullish(),
});

export const updateProcedureSchema = createProcedureSchema
  .omit({ patientId: true, doctorId: true, appointmentId: true })
  .partial()
  .extend({ isActive: z.boolean().optional() })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar",
  });

export type CreateProcedureInput = z.infer<typeof createProcedureSchema>;
export type UpdateProcedureInput = z.infer<typeof updateProcedureSchema>;