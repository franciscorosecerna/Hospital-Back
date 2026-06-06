import { db } from "../../db/client";
import { refreshTokens } from "../../db/schema/auth";
import { eq, and, gt, lt, isNull } from "drizzle-orm";
import { parsePgError, RecordNotFoundException } from "../../db/exceptions";

export type NewRefreshToken = typeof refreshTokens.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;

export async function createRefreshToken(
  data: NewRefreshToken
): Promise<RefreshToken> {
  try {
    const [token] = await db.insert(refreshTokens).values(data).returning();
    if (!token) throw new Error("Failed to create refresh token");
    return token;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function findRefreshTokenById(
  id: string
): Promise<RefreshToken | undefined> {
  try {
    const [token] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.id, id))
      .limit(1);

    return token;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function findActiveRefreshTokenByUserId(
  userId: string
): Promise<RefreshToken | undefined> {
  try {
    const [token] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    return token;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function findRefreshTokenByHash(
  tokenHash: string
): Promise<RefreshToken | undefined> {
  try {
    const [token] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    return token;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function revokeRefreshToken(id: string): Promise<void> {
  try {
    const result = await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, id))
      .returning({ id: refreshTokens.id });

    if (result.length === 0) {
      throw new RecordNotFoundException("refresh_tokens", id);
    }
  } catch (err) {
    if (err instanceof RecordNotFoundException) throw err;
    throw parsePgError(err);
  }
}

export async function revokeAllRefreshTokensByUserId(
  userId: string
): Promise<void> {
  try {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt))
      );
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteExpiredRefreshTokens(): Promise<void> {
  try {
    await db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, new Date()));
  } catch (err) {
    throw parsePgError(err);
  }
}