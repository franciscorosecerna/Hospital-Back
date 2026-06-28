import { eq, and } from "drizzle-orm";
import { db } from "../../../db/client";
import { users, doctors } from "../../../db/schema/users";
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

export type NewDoctor = typeof doctors.$inferInsert;
export type Doctor = typeof doctors.$inferSelect;
export type DoctorWithUser = { user: User; doctor: Doctor };

export async function getDoctorByUserId(userId: string): Promise<DoctorWithUser> {
  try {
    const [row] = await db
      .select()
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(and(eq(doctors.userId, userId), notDeleted));
    if (!row) throw new RecordNotFoundException("doctors", userId);
    return { user: row.users, doctor: row.doctors };
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getDoctorByMatricula(matricula: string): Promise<DoctorWithUser> {
  try {
    const [row] = await db
      .select()
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(and(eq(doctors.matricula, matricula), notDeleted));
    if (!row) throw new RecordNotFoundException("doctors", matricula);
    return { user: row.users, doctor: row.doctors };
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllDoctors(
  limit: number = 50,
  offset: number = 0
): Promise<DoctorWithUser[]> {
  try {
    const rows = await db
      .select()
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(notDeleted)
      .limit(limit)
      .offset(offset);
    return rows.map((r) => ({ user: r.users, doctor: r.doctors }));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createDoctor(
  userData: NewUser,
  doctorData: Omit<NewDoctor, "userId">,
  performedBy?: string
): Promise<DoctorWithUser> {
  try {
    return await db.transaction(async (tx: Tx) => {
      const user = await insertUser(tx, userData, performedBy);

      const [doctor] = await tx
        .insert(doctors)
        .values({ ...doctorData, userId: user.id })
        .returning();
      if (!doctor) throw new Error("Failed to create doctor");

      await insertAuditLogTx(tx, "created", "doctors", doctor.userId, undefined, doctor, performedBy);

      return { user, doctor };
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateDoctor(
  userId: string,
  data: Partial<Omit<NewDoctor, "userId">>,
  performedBy?: string
): Promise<DoctorWithUser> {
  try {
    return await db.transaction(async (tx: Tx) => {
      const [previous] = await tx
        .select()
        .from(doctors)
        .where(eq(doctors.userId, userId));
      if (!previous) throw new RecordNotFoundException("doctors", userId);

      const [updated] = await tx
        .update(doctors)
        .set(data)
        .where(eq(doctors.userId, userId))
        .returning();
      if (!updated) throw new RecordNotFoundException("doctors", userId);

      await insertAuditLogTx(tx, "updated", "doctors", userId, previous, updated, performedBy);

      const [userRow] = await tx
        .select()
        .from(users)
        .where(and(eq(users.id, userId), notDeleted));
      if (!userRow) throw new RecordNotFoundException("users", userId);

      return { user: userRow, doctor: updated };
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteDoctor(userId: string, performedBy?: string): Promise<void> {
  try {
    await db.transaction(async (tx: Tx) => {
      const [doctor] = await tx
        .select()
        .from(doctors)
        .where(eq(doctors.userId, userId));
      if (!doctor) throw new RecordNotFoundException("doctors", userId);

      await insertAuditLogTx(tx, "deleted", "doctors", userId, doctor, undefined, performedBy);

      await softDeleteUserTx(tx, userId, performedBy);
    });
  } catch (err) {
    throw parsePgError(err);
  }
}