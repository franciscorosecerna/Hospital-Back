import type { ValidatedContext } from "../../utils/validator";
import { create, getAll, getById } from "./auditLogService";
import type { AuditLogParam, AuditLogQuery, CreateAuditLogInput } from "./auditLogSchema";

export async function getAuditLogByIdHandler(c: ValidatedContext<unknown, AuditLogParam>) {
  const { id } = c.req.valid("param");
  const auditLog = await getById(id);
  return c.json(auditLog, 200);
}

export async function getAllAuditLogsHandler(c: ValidatedContext<unknown, unknown, AuditLogQuery>) {
  const filters = c.req.valid("query");
  const { limit, page } = filters;
  const auditLogs = await getAll(filters, limit, page);
  return c.json(auditLogs, 200);
}

export async function createAuditLogHandler(c: ValidatedContext<CreateAuditLogInput>) {
  const data = c.req.valid("json");
  const { sub: performedBy } = c.get("user");
  const newAuditLog = await create({ ...data, performedBy });
  return c.json(newAuditLog, 201);
}