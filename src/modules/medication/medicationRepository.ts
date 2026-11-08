import { asc, eq, ilike } from "drizzle-orm";
import { db } from "../../db/client";
import { medications } from "../../db/schema/prescriptions";
import { parsePgError, RecordNotFoundException } from "../../utils/exceptions";
import { insertAuditLogTx } from "../auditLogs/auditLogRepository";

export type Medication = typeof medications.$inferSelect;
export type NewMedication = typeof medications.$inferInsert;

export async function listMedications(
  limit: number = 20,
  offset: number = 0,
  search?: string,
): Promise<Medication[]> {
  try {
    return await db
      .select()
      .from(medications)
      .where(search ? ilike(medications.nombre, `%${search}%`) : undefined)
      .orderBy(asc(medications.nombre))
      .limit(limit)
      .offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getMedicationById(id: string): Promise<Medication> {
  try {
    const [medication] = await db.select().from(medications).where(eq(medications.id, id));
    if (!medication) throw new RecordNotFoundException("medications", id);
    return medication;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createMedication(
  data: Omit<NewMedication, "id">,
  performedBy: string,
): Promise<Medication> {
  try {
    return await db.transaction(async (tx) => {
      const [created] = await tx.insert(medications).values(data).returning();
      if (!created) throw new Error("Failed to create medication");
      await insertAuditLogTx(tx, "created", "medications", created.id, undefined, created, performedBy);
      return created;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateMedication(
  id: string,
  data: Partial<Omit<NewMedication, "id">>,
  performedBy: string,
): Promise<Medication> {
  try {
    return await db.transaction(async (tx) => {
      const [previous] = await tx.select().from(medications).where(eq(medications.id, id)).for("update");
      if (!previous) throw new RecordNotFoundException("medications", id);

      const [updated] = await tx
        .update(medications)
        .set(data)
        .where(eq(medications.id, id))
        .returning();
      if (!updated) throw new RecordNotFoundException("medications", id);

      await insertAuditLogTx(tx, "updated", "medications", id, previous, updated, performedBy);
      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteMedication(id: string, performedBy: string): Promise<Medication> {
  try {
    return await db.transaction(async (tx) => {
      const [previous] = await tx.select().from(medications).where(eq(medications.id, id)).for("update");
      if (!previous) throw new RecordNotFoundException("medications", id);

      await tx.delete(medications).where(eq(medications.id, id));
      await insertAuditLogTx(tx, "deleted", "medications", id, previous, undefined, performedBy);
      return previous;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}