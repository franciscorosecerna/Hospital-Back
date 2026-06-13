import { eq, and } from "drizzle-orm";
import { db } from "../../../db/client";
import { users, nurses } from "../../../db/schema/users";
import { parsePgError, RecordNotFoundException } from "../../../utils/exceptions";
import { withTimestamp } from "../../../utils/softDelete";
import { type User, type Tx, notDeleted, insertUser, softDeleteUserTx, type NewUser } from "../userRepository";

export type NewNurse = typeof nurses.$inferInsert;
export type Nurse = typeof nurses.$inferSelect;

export async function createNurse(
  userData: NewUser,
  nurseData: Omit<NewNurse, "userId">
): Promise<{ user: User; nurse: Nurse }> {
  try {
    return await db.transaction(async (tx: Tx) => {
      const user = await insertUser(tx, userData);
      const [nurse] = await tx
        .insert(nurses)
        .values({ ...nurseData, userId: user.id })
        .returning();
      if (!nurse) throw new Error("Failed to create nurse");
      return { user, nurse };
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getNurseByUserId(userId: string): Promise<Nurse> {
  try {
    const [nurse] = await db
      .select({ nurses })
      .from(nurses)
      .innerJoin(users, eq(nurses.userId, users.id))
      .where(and(eq(nurses.userId, userId), notDeleted))
      .then((rows) => rows.map((r) => r.nurses));
    if (!nurse) throw new RecordNotFoundException("nurses", userId);
    return nurse;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getNursesByDepartment(
  departmentId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Nurse[]> {
  try {
    return await db
      .select({ nurses })
      .from(nurses)
      .innerJoin(users, eq(nurses.userId, users.id))
      .where(and(eq(nurses.departmentId, departmentId), notDeleted))
      .limit(limit)
      .offset(offset)
      .then((rows) => rows.map((r) => r.nurses));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getNursesByTurno(
  turno: string,
  limit: number = 50,
  offset: number = 0
): Promise<Nurse[]> {
  try {
    return await db
      .select({ nurses })
      .from(nurses)
      .innerJoin(users, eq(nurses.userId, users.id))
      .where(and(eq(nurses.turno, turno), notDeleted))
      .limit(limit)
      .offset(offset)
      .then((rows) => rows.map((r) => r.nurses));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllNurses(
  limit: number = 50,
  offset: number = 0
): Promise<Nurse[]> {
  try {
    return await db
      .select({ nurses })
      .from(nurses)
      .innerJoin(users, eq(nurses.userId, users.id))
      .where(notDeleted)
      .limit(limit)
      .offset(offset)
      .then((rows) => rows.map((r) => r.nurses));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateNurse(
  userId: string,
  data: Partial<Omit<NewNurse, "userId">>
): Promise<Nurse> {
  try {
    const [updated] = await db
      .update(nurses)
      .set(withTimestamp(data))
      .where(eq(nurses.userId, userId))
      .returning();
    if (!updated) throw new RecordNotFoundException("nurses", userId);
    return updated;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteNurse(userId: string): Promise<void> {
  try {
    await db.transaction(async (tx: Tx) => {
      const [nurse] = await tx
        .select({ userId: nurses.userId })
        .from(nurses)
        .where(eq(nurses.userId, userId));
      if (!nurse) throw new RecordNotFoundException("nurses", userId);
      await softDeleteUserTx(tx, userId);
    });
  } catch (err) {
    throw parsePgError(err);
  }
}