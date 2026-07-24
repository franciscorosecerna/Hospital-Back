import { z } from "zod";

const uuidSchema = z.uuid();

export const auditActionSchema = z.enum(["created", "updated", "deleted"]);

export const auditLogParamSchema = z.object({
  id: uuidSchema,
});

export const auditLogQuerySchema = z.object({
  tableName: z.string().min(1).optional(),
  recordId: uuidSchema.optional(),
  action: auditActionSchema.optional(),
  performedBy: uuidSchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  page: z.coerce.number().int().nonnegative().optional(),
});

export const createAuditLogSchema = z.object({
  tableName: z.string().min(1).max(100),
  recordId: uuidSchema,
  action: auditActionSchema,
  previousData: z.record(z.string(), z.unknown()).nullable().optional(),
  newData: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type AuditLogParam = z.infer<typeof auditLogParamSchema>;
export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;