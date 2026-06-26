import { eq, and } from "drizzle-orm";
import { db } from "../../../db/client";
import { users, nurses } from "../../../db/schema/users";
import { auditLogs, type AuditAction } from "../../../db/schema/auditLogs";
import { parsePgError, RecordNotFoundException } from "../../../utils/exceptions";
import {
  type User,
  type Tx,
  notDeleted,
  insertUser,
  softDeleteUserTx,
  type NewUser,
} from "../userRepository";

export type NewNurse = typeof nurses.$inferInsert;
export type Nurse = typeof nurses.$inferSelect;
export type NurseWithUser = { user: User; nurse: Nurse };

async function insertNurseAuditLog(
  tx: Tx,
  action: AuditAction,
  recordId: string,
  previousData?: object,
  newData?: object,
  performedBy?: string
): Promise<void> {
  await tx.insert(auditLogs).values({
    tableName: "nurses",
    recordId,
    action,
    previousData,
    newData,
    performedBy,
  });
}

export async function getNurseByUserId(userId: string): Promise<NurseWithUser> {
  try {
    const [row] = await db
      .select()
      .from(nurses)
      .innerJoin(users, eq(nurses.userId, users.id))
      .where(and(eq(nurses.userId, userId), notDeleted));
    if (!row) throw new RecordNotFoundException("nurses", userId);
    return { user: row.users, nurse: row.nurses };
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getNursesByDepartment(
  departmentId: string,
  limit: number = 50,
  offset: number = 0
): Promise<NurseWithUser[]> {
  try {
    const rows = await db
      .select()
      .from(nurses)
      .innerJoin(users, eq(nurses.userId, users.id))
      .where(and(eq(nurses.departmentId, departmentId), notDeleted))
      .limit(limit)
      .offset(offset);
    return rows.map((r) => ({ user: r.users, nurse: r.nurses }));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getNursesByTurno(
  turno: string,
  limit: number = 50,
  offset: number = 0
): Promise<NurseWithUser[]> {
  try {
    const rows = await db
      .select()
      .from(nurses)
      .innerJoin(users, eq(nurses.userId, users.id))
      .where(and(eq(nurses.turno, turno), notDeleted))
      .limit(limit)
      .offset(offset);
    return rows.map((r) => ({ user: r.users, nurse: r.nurses }));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllNurses(
  limit: number = 50,
  offset: number = 0
): Promise<NurseWithUser[]> {
  try {
    const rows = await db
      .select()
      .from(nurses)
      .innerJoin(users, eq(nurses.userId, users.id))
      .where(notDeleted)
      .limit(limit)
      .offset(offset);
    return rows.map((r) => ({ user: r.users, nurse: r.nurses }));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createNurse(
  userData: NewUser,
  nurseData: Omit<NewNurse, "userId">,
  performedBy?: string
): Promise<NurseWithUser> {
  try {
    return await db.transaction(async (tx: Tx) => {
      const user = await insertUser(tx, userData, performedBy);

      const [nurse] = await tx
        .insert(nurses)
        .values({ ...nurseData, userId: user.id })
        .returning();
      if (!nurse) throw new Error("Failed to create nurse");

      await insertNurseAuditLog(tx, "created", nurse.userId, undefined, nurse, performedBy);

      return { user, nurse };
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateNurse(
  userId: string,
  data: Partial<Omit<NewNurse, "userId">>,
  performedBy?: string
): Promise<NurseWithUser> {
  try {
    return await db.transaction(async (tx: Tx) => {
      const [previous] = await tx
        .select()
        .from(nurses)
        .where(eq(nurses.userId, userId));
      if (!previous) throw new RecordNotFoundException("nurses", userId);

      const [updated] = await tx
        .update(nurses)
        .set(data)
        .where(eq(nurses.userId, userId))
        .returning();
      if (!updated) throw new RecordNotFoundException("nurses", userId);

      await insertNurseAuditLog(tx, "updated", userId, previous, updated, performedBy);

      const [userRow] = await tx
        .select()
        .from(users)
        .where(and(eq(users.id, userId), notDeleted));
      if (!userRow) throw new RecordNotFoundException("users", userId);

      return { user: userRow, nurse: updated };
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteNurse(userId: string, performedBy?: string): Promise<void> {
  try {
    await db.transaction(async (tx: Tx) => {
      const [nurse] = await tx
        .select()
        .from(nurses)
        .where(eq(nurses.userId, userId));
      if (!nurse) throw new RecordNotFoundException("nurses", userId);

      await insertNurseAuditLog(tx, "deleted", userId, nurse, undefined, performedBy);

      await softDeleteUserTx(tx, userId, performedBy);
    });
  } catch (err) {
    throw parsePgError(err);
  }
}