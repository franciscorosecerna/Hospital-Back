import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { procedures } from "../../db/schema/clinical";
import { parsePgError, RecordNotFoundException } from "../../utils/exceptions";
import { insertAuditLogTx } from "../auditLogs/auditLogRepository";

export type NewProcedure = typeof procedures.$inferInsert;
export type Procedure = typeof procedures.$inferSelect;
export const notDeleted = eq(procedures.isActive, true);

export async function getProcedureById(id: string): Promise<Procedure> {
  try {
    const [procedure] = await db
      .select()
      .from(procedures)
      .where(and(eq(procedures.id, id), notDeleted));
    if (!procedure) throw new RecordNotFoundException("procedures", id);
    return procedure;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getProceduresByPatient(patientId: string, limit: number, offset: number): Promise<Procedure[]> {
  try {
    return await db
      .select()
      .from(procedures)
      .where(and(eq(procedures.patientId, patientId), notDeleted))
      .limit(limit)
      .offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getProceduresByDoctor(doctorId: string, limit: number, offset: number): Promise<Procedure[]> {
  try {
    return await db
      .select()
      .from(procedures)
      .where(and(eq(procedures.doctorId, doctorId), notDeleted))
      .limit(limit)
      .offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getProceduresByAppointment(
  appointmentId: string
): Promise<Procedure[]> {
  try {
    return await db
      .select()
      .from(procedures)
      .where(and(eq(procedures.appointmentId, appointmentId), notDeleted));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createProcedure(
  data: NewProcedure,
  performedBy?: string
): Promise<Procedure> {
  try {
    return await db.transaction(async (tx) => {
      const [procedure] = await tx.insert(procedures).values(data).returning();
      if (!procedure) throw new Error("Failed to create procedure");

      await insertAuditLogTx(
        tx,
        "created",
        "procedures",
        procedure.id,
        undefined,
        procedure,
        performedBy
      );

      return procedure;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateProcedure(
  id: string,
  data: Partial<Omit<NewProcedure, "id">>,
  performedBy?: string
): Promise<Procedure> {
  try {
    return await db.transaction(async (tx) => {
      const [previous] = await tx
        .select()
        .from(procedures)
        .where(and(eq(procedures.id, id), notDeleted));
      if (!previous) throw new RecordNotFoundException("procedures", id);

      const [updated] = await tx
        .update(procedures)
        .set(data)
        .where(and(eq(procedures.id, id), notDeleted))
        .returning();
      if (!updated) throw new RecordNotFoundException("procedures", id);

      await insertAuditLogTx(tx, "updated", "procedures", id, previous, updated, performedBy);

      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteProcedure(
  id: string,
  performedBy?: string
): Promise<Procedure> {
  try {
    return await db.transaction(async (tx) => {
      const [deleted] = await tx
        .update(procedures)
        .set({ isActive: false })
        .where(and(eq(procedures.id, id), notDeleted))
        .returning();
      if (!deleted) throw new RecordNotFoundException("procedures", id);

      await insertAuditLogTx(tx, "deleted", "procedures", id, deleted, undefined, performedBy);

      return deleted;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}