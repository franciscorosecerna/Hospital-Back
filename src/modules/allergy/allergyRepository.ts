import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { allergies } from "../../db/schema/clinical";
import { parsePgError, RecordNotFoundException } from "../../utils/exceptions";
import { insertAuditLogTx } from "../auditLogs/auditLogRepository";
 
export type NewAllergy = typeof allergies.$inferInsert;
export type Allergy = typeof allergies.$inferSelect;
export const notDeleted = eq(allergies.isActive, true);

export async function getAllergyById(id: string): Promise<Allergy> {
  try {
    const [allergy] = await db
      .select()
      .from(allergies)
      .where(and(eq(allergies.id, id), notDeleted));
    if (!allergy) throw new RecordNotFoundException("allergies", id);
    return allergy;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllergyByPatientAndSustancia(
  patientId: string,
  sustancia: string
): Promise<Allergy> {
  try {
    const [allergy] = await db
      .select()
      .from(allergies)
      .where(
        and(
          eq(allergies.patientId, patientId),
          eq(allergies.sustancia, sustancia),
          notDeleted
        )
      );
    if (!allergy)
      throw new RecordNotFoundException("allergies", `${patientId}:${sustancia}`);
    return allergy;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllergiesByPatient(patientId: string, limit: number, offset: number): Promise<Allergy[]> {
  try {
    return await db
      .select()
      .from(allergies)
      .where(and(eq(allergies.patientId, patientId), notDeleted))
      .limit(limit)
      .offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createAllergy(
  data: NewAllergy,
  performedBy?: string
): Promise<Allergy> {
  try {
    return await db.transaction(async (tx) => {
      const [allergy] = await tx.insert(allergies).values(data).returning();
      if (!allergy) throw new Error("Failed to create allergy");
 
      await insertAuditLogTx(tx, "created", "allergies", allergy.id, undefined, allergy, performedBy);
 
      return allergy;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateAllergy(
  id: string,
  data: Partial<Omit<NewAllergy, "id">>,
  performedBy?: string
): Promise<Allergy> {
  try {
    return await db.transaction(async (tx) => {
      const [previous] = await tx
        .select()
        .from(allergies)
        .where(and(eq(allergies.id, id), notDeleted));
      if (!previous) throw new RecordNotFoundException("allergies", id);
 
      const [updated] = await tx
        .update(allergies)
        .set(data)
        .where(and(eq(allergies.id, id), notDeleted))
        .returning();
      if (!updated) throw new RecordNotFoundException("allergies", id);
 
      await insertAuditLogTx(tx, "updated", "allergies", id, previous, updated, performedBy);
 
      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteAllergy(
  id: string,
  performedBy?: string
): Promise<Allergy> {
  try {
    return await db.transaction(async (tx) => {
      const [deleted] = await tx
        .update(allergies)
        .set({ isActive: false })
        .where(and(eq(allergies.id, id), notDeleted))
        .returning();
      if (!deleted) throw new RecordNotFoundException("allergies", id);
 
      await insertAuditLogTx(tx, "deleted", "allergies", id, deleted, undefined, performedBy);
 
      return deleted;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}