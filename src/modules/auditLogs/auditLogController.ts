import type { Context } from "hono";
import type { TokenPayload } from "../authorization/authorizationService";
import { create, getAll, getById } from "./auditLogService";
import type { CreateAuditLogInput } from "./auditLogSchema";

type AuthedContext = Context<{ Variables: { user: TokenPayload } }>;

export async function getAuditLogByIdHandler(c: Context) {
  const { id } = c.req.valid("param" as never);
  const auditLog = await getById(id);
  return c.json(auditLog, 200);
}

export async function getAllAuditLogsHandler(c: Context) {
  const filters = c.req.valid("query" as never);
  const limit = parseInt(c.req.query("limit") || "50", 10);
  const page = parseInt(c.req.query("page") || "0", 10);
  const auditLogs = await getAll(filters, limit, page);
  return c.json(auditLogs, 200);
}

export async function createAuditLogHandler(c: AuthedContext) {
  const data = c.req.valid("json" as never) as CreateAuditLogInput;
  const { sub: performedBy } = c.get("user");
  const newAuditLog = await create({ ...data, performedBy });
  return c.json(newAuditLog, 201);
}