import { eq, and } from "drizzle-orm";
import { db } from "../../../db/client";
import { users, patients } from "../../../db/schema/users";
import { insertAuditLogTx } from "../../auditLogs/auditLogRepository";
import { parsePgError, RecordNotFoundException } from "../../../utils/exceptions";
import {
  type User,
  type Tx,
  notDeleted,
  insertUser,
  softDeleteUserTx,
  type NewUser,
} from "../userRepository";

export type NewPatient = typeof patients.$inferInsert;
export type Patient = typeof patients.$inferSelect;
export type PatientWithUser = { user: User; patient: Patient };


export async function getPatientByUserId(userId: string): Promise<PatientWithUser> {
  try {
    const [row] = await db
      .select()
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(and(eq(patients.userId, userId), notDeleted));
    if (!row) throw new RecordNotFoundException("patients", userId);
    return { user: row.users, patient: row.patients };
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getPatientByHistoriaClinica(
  numeroHistoriaClinica: string
): Promise<PatientWithUser> {
  try {
    const [row] = await db
      .select()
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(and(eq(patients.numeroHistoriaClinica, numeroHistoriaClinica), notDeleted));
    if (!row) throw new RecordNotFoundException("patients", numeroHistoriaClinica);
    return { user: row.users, patient: row.patients };
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllPatients(
  limit: number = 50,
  offset: number = 0
): Promise<PatientWithUser[]> {
  try {
    const rows = await db
      .select()
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(notDeleted)
      .limit(limit)
      .offset(offset);
    return rows.map((r) => ({ user: r.users, patient: r.patients }));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createPatient(
  userData: NewUser,
  patientData: Omit<NewPatient, "userId">,
  performedBy?: string
): Promise<PatientWithUser> {
  try {
    return await db.transaction(async (tx: Tx) => {
      const user = await insertUser(tx, userData, performedBy);

      const [patient] = await tx
        .insert(patients)
        .values({ ...patientData, userId: user.id })
        .returning();
      if (!patient) throw new Error("Failed to create patient");

      await insertAuditLogTx(tx, "created", "patients", patient.userId, undefined, patient, performedBy);

      return { user, patient };
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updatePatient(
  userId: string,
  data: Partial<Omit<NewPatient, "userId">>,
  performedBy?: string
): Promise<PatientWithUser> {
  try {
    return await db.transaction(async (tx: Tx) => {
      const [previous] = await tx
        .select()
        .from(patients)
        .where(eq(patients.userId, userId));
      if (!previous) throw new RecordNotFoundException("patients", userId);

      const [updated] = await tx
        .update(patients)
        .set(data)
        .where(eq(patients.userId, userId))
        .returning();
      if (!updated) throw new RecordNotFoundException("patients", userId);

      await insertAuditLogTx(tx, "updated", "patients", userId, previous, updated, performedBy);

      const [userRow] = await tx
        .select()
        .from(users)
        .where(and(eq(users.id, userId), notDeleted));
      if (!userRow) throw new RecordNotFoundException("users", userId);

      return { user: userRow, patient: updated };
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deletePatient(userId: string, performedBy?: string): Promise<void> {
  try {
    await db.transaction(async (tx: Tx) => {
      const [patient] = await tx
        .select()
        .from(patients)
        .where(eq(patients.userId, userId));
      if (!patient) throw new RecordNotFoundException("patients", userId);

      await insertAuditLogTx(tx, "deleted", "patients", userId, patient, undefined, performedBy);

      await softDeleteUserTx(tx, userId, performedBy);
    });
  } catch (err) {
    throw parsePgError(err);
  }
}