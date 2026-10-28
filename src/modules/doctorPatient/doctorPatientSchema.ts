import z from "zod";

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  page: z.coerce.number().int().positive().optional().default(1),
});

const uuid = z.uuid("Debe ser un UUID válido");

const dateString = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido, use YYYY-MM-DD")
    .refine((v) => {
        const d = new Date(`${v}T00:00:00Z`);
        return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v);
    }, "Fecha inexistente"
);

export const assignmentIdParamSchema = z.object({
    id: uuid,
});
 
export const patientIdParamSchema = z.object({
    patientId: uuid,
});
 
export const doctorIdParamSchema = z.object({
    doctorId: uuid,
});
 
export const createAssignmentSchema = z.object({
    doctorId: uuid,
    patientId: uuid,
    fechaAsignacion: dateString.optional(),
});
 
export const finalizeAssignmentSchema = z.object({
    fechaFinalizacion: dateString,
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type FinalizeAssignmentInput = z.infer<typeof finalizeAssignmentSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;