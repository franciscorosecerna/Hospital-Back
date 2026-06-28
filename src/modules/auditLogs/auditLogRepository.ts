import { eq, and, gte, lte, desc, type SQL} from "drizzle-orm";
import { db } from "../../db/client";
import { auditLogs, type AuditAction } from "../../db/schema/auditLogs";
import { parsePgError, RecordNotFoundException } from "../../utils/exceptions";

export type NewAuditLog = typeof auditLogs.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface AuditLogFilters {
  tableName?: string;
  recordId?: string;
  action?: AuditAction;
  performedBy?: string;
  from?: Date;
  to?: Date;
}

export async function getAuditLogById(id: string): Promise<AuditLog> {
  try {
    const [log] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.id, id));
    if (!log) throw new RecordNotFoundException("audit_logs", id);
    return log;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAuditLogs(
  filters: AuditLogFilters = {},
  limit: number = 50,
  offset: number = 0
): Promise<AuditLog[]> {
  try {
    const conditions: SQL[] = [];

    if (filters.tableName)
      conditions.push(eq(auditLogs.tableName, filters.tableName));
    if (filters.recordId)
      conditions.push(eq(auditLogs.recordId, filters.recordId));
    if (filters.action)
      conditions.push(eq(auditLogs.action, filters.action));
    if (filters.performedBy)
      conditions.push(eq(auditLogs.performedBy, filters.performedBy));
    if (filters.from)
      conditions.push(gte(auditLogs.performedAt, filters.from));
    if (filters.to)
      conditions.push(lte(auditLogs.performedAt, filters.to));

    const query = db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.performedAt))
      .limit(limit)
      .offset(offset);

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }

    return await query;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createAuditLog(data: NewAuditLog): Promise<AuditLog> {
  try {
    const [log] = await db.insert(auditLogs).values(data).returning();
    if (!log) throw new Error("Failed to create audit log");
    return log;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function insertAuditLogTx(
  tx: Tx,
  action: AuditAction,
  tableName: string,
  recordId: string,
  previousData?: object,
  newData?: object,
  performedBy?: string
): Promise<void> {
  await tx.insert(auditLogs).values({
    tableName,
    recordId,
    action,
    previousData,
    newData,
    performedBy,
  });
}