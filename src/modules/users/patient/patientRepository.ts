import { eq, and } from "drizzle-orm";
import { db } from "../../../db/client";
import { users, patients } from "../../../db/schema/users";
import { parsePgError, RecordNotFoundException } from "../../../utils/exceptions";
import { withTimestamp } from "../../../utils/softDelete";
import { type User, type Tx, notDeleted, insertUser, softDeleteUserTx, type NewUser } from "../userRepository";

export type NewPatient = typeof patients.$inferInsert;
export type Patient = typeof patients.$inferSelect;

export async function createPatient(
  userData: NewUser,
  patientData: Omit<NewPatient, "userId">
): Promise<{ user: User; patient: Patient }> {
  try {
    return await db.transaction(async (tx: Tx) => {
      const user = await insertUser(tx, userData);
      const [patient] = await tx
        .insert(patients)
        .values({ ...patientData, userId: user.id })
        .returning();
      if (!patient) throw new Error("Failed to create patient");
      return { user, patient };
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getPatientByUserId(userId: string): Promise<Patient> {
  try {
    const [patient] = await db
      .select({ patients })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(and(eq(patients.userId, userId), notDeleted))
      .then((rows) => rows.map((r) => r.patients));
    if (!patient) throw new RecordNotFoundException("patients", userId);
    return patient;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getPatientByHistoriaClinica(
  numeroHistoriaClinica: string
): Promise<Patient> {
  try {
    const [patient] = await db
      .select({ patients })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(
        and(eq(patients.numeroHistoriaClinica, numeroHistoriaClinica), notDeleted)
      )
      .then((rows) => rows.map((r) => r.patients));
    if (!patient)
      throw new RecordNotFoundException("patients", numeroHistoriaClinica);
    return patient;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllPatients(
  limit: number = 50,
  offset: number = 0
): Promise<Patient[]> {
  try {
    return await db
      .select({ patients })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(notDeleted)
      .limit(limit)
      .offset(offset)
      .then((rows) => rows.map((r) => r.patients));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updatePatient(
  userId: string,
  data: Partial<Omit<NewPatient, "userId">>
): Promise<Patient> {
  try {
    const [updated] = await db
      .update(patients)
      .set(withTimestamp(data))
      .where(eq(patients.userId, userId))
      .returning();
    if (!updated) throw new RecordNotFoundException("patients", userId);
    return updated;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deletePatient(userId: string): Promise<void> {
  try {
    await db.transaction(async (tx: Tx) => {
      const [patient] = await tx
        .select({ userId: patients.userId })
        .from(patients)
        .where(eq(patients.userId, userId));
      if (!patient) throw new RecordNotFoundException("patients", userId);
      await softDeleteUserTx(tx, userId);
    });
  } catch (err) {
    throw parsePgError(err);
  }
}