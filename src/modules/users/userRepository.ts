import { eq, and, isNull } from "drizzle-orm";
import { db } from "../../db/client";
import { users } from "../../db/schema/users";
import { parsePgError, RecordNotFoundException } from "../../utils/exceptions";
import { withTimestamp, softDeletePayload } from "../../utils/softDelete";

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const notDeleted = isNull(users.deletedAt);

export async function createUser(data: NewUser): Promise<User> {
  let result: User | undefined;
  try {
    [result] = await db.insert(users).values(data).returning();
  } catch (err) {
    throw parsePgError(err);
  }
  if (!result) throw new Error("Failed to create user");
  return result;
}

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

export async function updateUser(
  id: string,
  data: Partial<Omit<NewUser, "id">>
): Promise<User> {
  try {
    const [updated] = await db
      .update(users)
      .set(withTimestamp(data))
      .where(and(eq(users.id, id), notDeleted))
      .returning();
    if (!updated) throw new RecordNotFoundException("users", id);
    return updated;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updatePassword(
  id: string,
  hashedPassword: string
): Promise<void> {
  try {
    const [updated] = await db
      .update(users)
      .set(withTimestamp({ password: hashedPassword }))
      .where(and(eq(users.id, id), notDeleted))
      .returning({ id: users.id });
    if (!updated) throw new RecordNotFoundException("users", id);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteUser(id: string): Promise<User> {
  try {
    const [deleted] = await db
      .update(users)
      .set(softDeletePayload())
      .where(and(eq(users.id, id), notDeleted))
      .returning();
    if (!deleted) throw new RecordNotFoundException("users", id);
    return deleted;
  } catch (err) {
    throw parsePgError(err);
  }
}

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function insertUser(tx: Tx, data: NewUser): Promise<User> {
  const [user] = await tx.insert(users).values(data).returning();
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function softDeleteUserTx(tx: Tx, id: string): Promise<void> {
  const [updated] = await tx
    .update(users)
    .set(softDeletePayload())
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning({ id: users.id });
  if (!updated) throw new RecordNotFoundException("users", id);
}