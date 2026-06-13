import { eq, and } from "drizzle-orm";
import { db } from "../../../db/client";
import { users, doctors } from "../../../db/schema/users";
import { parsePgError, RecordNotFoundException } from "../../../utils/exceptions";
import { withTimestamp } from "../../../utils/softDelete";
import { type User, type Tx, notDeleted, insertUser, softDeleteUserTx, type NewUser } from "../userRepository";

export type NewDoctor = typeof doctors.$inferInsert;
export type Doctor = typeof doctors.$inferSelect;

export async function createDoctor(
  userData: NewUser,
  doctorData: Omit<NewDoctor, "userId">
): Promise<{ user: User; doctor: Doctor }> {
  try {
    return await db.transaction(async (tx: Tx) => {
      const user = await insertUser(tx, userData );
      const [doctor] = await tx
        .insert(doctors)
        .values({ ...doctorData, userId: user.id })
        .returning();
      if (!doctor) throw new Error("Failed to create doctor");
      return { user, doctor };
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getDoctorByUserId(userId: string): Promise<Doctor> {
  try {
    const [doctor] = await db
      .select()
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(and(eq(doctors.userId, userId), notDeleted))
      .then((rows) => rows.map((r) => r.doctors));
    if (!doctor) throw new RecordNotFoundException("doctors", userId);
    return doctor;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getDoctorByMatricula(matricula: string): Promise<Doctor> {
  try {
    const [doctor] = await db
      .select({ doctors })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(and(eq(doctors.matricula, matricula), notDeleted))
      .then((rows) => rows.map((r) => r.doctors));
    if (!doctor) throw new RecordNotFoundException("doctors", matricula);
    return doctor;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllDoctors(
  limit: number = 50,
  offset: number = 0
): Promise<Doctor[]> {
  try {
    return await db
      .select({ doctors })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(notDeleted)
      .limit(limit)
      .offset(offset)
      .then((rows) => rows.map((r) => r.doctors));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateDoctor(
  userId: string,
  data: Partial<Omit<NewDoctor, "userId">>
): Promise<Doctor> {
  try {
    const [updated] = await db
      .update(doctors)
      .set(withTimestamp(data))
      .where(eq(doctors.userId, userId))
      .returning();
    if (!updated) throw new RecordNotFoundException("doctors", userId);
    return updated;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteDoctor(userId: string): Promise<void> {
  try {
    await db.transaction(async (tx: Tx) => {
      const [doctor] = await tx
        .select({ userId: doctors.userId })
        .from(doctors)
        .where(eq(doctors.userId, userId));
      if (!doctor) throw new RecordNotFoundException("doctors", userId);
      await softDeleteUserTx(tx, userId);
    });
  } catch (err) {
    throw parsePgError(err);
  }
}