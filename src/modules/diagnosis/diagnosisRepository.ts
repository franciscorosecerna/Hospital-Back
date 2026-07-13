import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { diagnoses } from "../../db/schema/clinical";
import { parsePgError, RecordNotFoundException } from "../../utils/exceptions";
import { insertAuditLogTx } from "../auditLogs/auditLogRepository";

export type NewDiagnosis = typeof diagnoses.$inferInsert;
export type Diagnosis = typeof diagnoses.$inferSelect;
export const notDeleted = eq(diagnoses.isActive, true);

export async function getDiagnosisById(id: string): Promise<Diagnosis> {
  try {
    const [diagnosis] = await db
      .select()
      .from(diagnoses)
      .where(and(eq(diagnoses.id, id), notDeleted));
    if (!diagnosis) throw new RecordNotFoundException("diagnoses", id);
    return diagnosis;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getDiagnosesByPatient(patientId: string): Promise<Diagnosis[]> {
  try {
    return await db
      .select()
      .from(diagnoses)
      .where(and(eq(diagnoses.patientId, patientId), notDeleted));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getDiagnosesByAppointment(
  appointmentId: string
): Promise<Diagnosis[]> {
  try {
    return await db
      .select()
      .from(diagnoses)
      .where(and(eq(diagnoses.appointmentId, appointmentId), notDeleted));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createDiagnosis(
  data: NewDiagnosis,
  performedBy?: string
): Promise<Diagnosis> {
  try {
    return await db.transaction(async (tx) => {
      const [diagnosis] = await tx.insert(diagnoses).values(data).returning();
      if (!diagnosis) throw new Error("Failed to create diagnosis");

      await insertAuditLogTx(
        tx,
        "created",
        "diagnoses",
        diagnosis.id,
        undefined,
        diagnosis,
        performedBy
      );

      return diagnosis;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateDiagnosis(
  id: string,
  data: Partial<Omit<NewDiagnosis, "id">>,
  performedBy?: string
): Promise<Diagnosis> {
  try {
    return await db.transaction(async (tx) => {
      const [previous] = await tx
        .select()
        .from(diagnoses)
        .where(and(eq(diagnoses.id, id), notDeleted));
      if (!previous) throw new RecordNotFoundException("diagnoses", id);

      const [updated] = await tx
        .update(diagnoses)
        .set(data)
        .where(and(eq(diagnoses.id, id), notDeleted))
        .returning();
      if (!updated) throw new RecordNotFoundException("diagnoses", id);

      await insertAuditLogTx(tx, "updated", "diagnoses", id, previous, updated, performedBy);

      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteDiagnosis(
  id: string,
  performedBy?: string
): Promise<Diagnosis> {
  try {
    return await db.transaction(async (tx) => {
      const [deleted] = await tx
        .update(diagnoses)
        .set({ isActive: false })
        .where(and(eq(diagnoses.id, id), notDeleted))
        .returning();
      if (!deleted) throw new RecordNotFoundException("diagnoses", id);

      await insertAuditLogTx(tx, "deleted", "diagnoses", id, deleted, undefined, performedBy);

      return deleted;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}