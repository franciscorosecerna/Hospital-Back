import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { users } from "../../db/schema/users";
import { parsePgError, RecordNotFoundException } from "../../utils/exceptions";
import { insertAuditLogTx } from "../auditLogs/auditLogRepository";

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export const notDeleted = eq(users.isActive, true);


export async function getUserById(id: string): Promise<User> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), notDeleted));
    if (!user) throw new RecordNotFoundException("users", id);
    return user;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getUserByDocumento(
  tipoDocumento: string,
  documento: string
): Promise<User> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.tipoDocumento, tipoDocumento),
          eq(users.documento, documento),
          notDeleted
        )
      );
    if (!user)
      throw new RecordNotFoundException("users", `${tipoDocumento}:${documento}`);
    return user;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllUsers(
  limit: number = 50,
  offset: number = 0
): Promise<User[]> {
  try {
    return await db
      .select()
      .from(users)
      .where(notDeleted)
      .limit(limit)
      .offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createUser(
  data: NewUser,
  performedBy?: string
): Promise<User> {
  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values(data).returning();
      if (!user) throw new Error("Failed to create user");

      await insertAuditLogTx(tx, "created", "users", user.id, undefined, user, performedBy);

      return user;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateUser(
  id: string,
  data: Partial<Omit<NewUser, "id">>,
  performedBy?: string
): Promise<User> {
  try {
    return await db.transaction(async (tx) => {
      const [previous] = await tx
        .select()
        .from(users)
        .where(and(eq(users.id, id), notDeleted));
      if (!previous) throw new RecordNotFoundException("users", id);

      const [updated] = await tx
        .update(users)
        .set(data)
        .where(and(eq(users.id, id), notDeleted))
        .returning();
      if (!updated) throw new RecordNotFoundException("users", id);

      await insertAuditLogTx(tx, "updated", "users", id, previous, updated, performedBy);

      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updatePassword(
  id: string,
  hashedPassword: string,
  performedBy?: string
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(users)
        .set({ password: hashedPassword })
        .where(and(eq(users.id, id), notDeleted))
        .returning({ id: users.id });
      if (!updated) throw new RecordNotFoundException("users", id);

      await insertAuditLogTx(tx, "updated", "users", id, undefined, undefined, performedBy);
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteUser(
  id: string,
  performedBy?: string
): Promise<User> {
  try {
    return await db.transaction(async (tx) => {
      const [deleted] = await tx
        .update(users)
        .set({ isActive: false })
        .where(and(eq(users.id, id), notDeleted))
        .returning();
      if (!deleted) throw new RecordNotFoundException("users", id);

      await insertAuditLogTx(tx, "deleted", "users", id, deleted, undefined, performedBy);

      return deleted;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function insertUser(tx: Tx, data: NewUser, performedBy?: string): Promise<User> {
  const [user] = await tx.insert(users).values(data).returning();
  if (!user) throw new Error("Failed to create user");

  await insertAuditLogTx(tx, "created", "users", user.id, undefined, user, performedBy);

  return user;
}


export async function softDeleteUserTx(tx: Tx, id: string, performedBy?: string): Promise<void> {
  const [deleted] = await tx
    .update(users)
    .set({ isActive: false })
    .where(and(eq(users.id, id), notDeleted))
    .returning();
  if (!deleted) throw new RecordNotFoundException("users", id);

  await insertAuditLogTx(tx, "deleted", "users", id, deleted, undefined, performedBy);
}