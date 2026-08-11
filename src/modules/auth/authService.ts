import { sign, verify } from "hono/jwt";
import { createHash } from "crypto";
import argon from "argon2";
import { v7 as uuidv7 } from "uuid";
import { getUserByDocumento } from "../users/userRepository";
import {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
  rotateRefreshToken,
  revokeAllRefreshTokensByUserId,
} from "./authRepository";
import { buildTokenPayload, type TokenPayload } from "../authorization/authorizationService";
import { InvalidCredentialsException } from "../../utils/exceptions";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_TTL_SEC = 15 * 60;            // 15 min
const REFRESH_TOKEN_TTL_SEC = 7 * 24 * 60 * 60;  // 7 días

export interface LoginInput {
  documento: string;
  tipoDocumento: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function signAccessToken(payload: TokenPayload): Promise<string> {
  return sign(
    { ...payload, exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SEC },
    ACCESS_TOKEN_SECRET
  );
}

async function signRefreshToken(userId: string, jti: string): Promise<string> {
  return sign(
    {
      sub: userId,
      jti,
      exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL_SEC,
    },
    REFRESH_TOKEN_SECRET
  );
}

function refreshTokenExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_SEC * 1000);
}

export async function login(input: LoginInput): Promise<AuthTokens> {
  const user = await getUserByDocumento(input.tipoDocumento, input.documento);
  const DUMMY_HASH =
  "$2b$12$J3P1G7dD8V0F0l1HjFh0zOQ5jUj7dD1R0Q3s8w5L7tN6yP2eW8h9K";
  
  const passwordMatch = user
  ? await argon.verify(input.password, user.password)
  : await argon.verify(input.password, DUMMY_HASH);

  if (!user || !passwordMatch) {
    throw new InvalidCredentialsException();
    }

  const payload = await buildTokenPayload(user.id);
  const accessToken = await signAccessToken(payload);

  const jti = uuidv7();
  const rawRefreshToken = await signRefreshToken(user.id, jti);

  await createRefreshToken({
    id: jti,
    userId: user.id,
    tokenHash: hashToken(rawRefreshToken),
    expiresAt: refreshTokenExpiresAt(),
  });

  return { accessToken, refreshToken: rawRefreshToken };
}

export async function refresh(rawRefreshToken: string): Promise<AuthTokens> {
  let decoded: RefreshTokenPayload;

  try {
    decoded = (await verify(rawRefreshToken, REFRESH_TOKEN_SECRET, "HS256")) as unknown as RefreshTokenPayload;
  } catch {
    throw new InvalidCredentialsException();
  }

  const stored = await findRefreshTokenByHash(hashToken(rawRefreshToken));

  if (!stored) {
    throw new InvalidCredentialsException();
  }

  if (stored.revokedAt !== null) {
    await revokeAllRefreshTokensByUserId(decoded.sub);
    throw new InvalidCredentialsException();
  }

  if (stored.expiresAt < new Date()) {
    await revokeRefreshToken(stored.id);
    throw new InvalidCredentialsException();
  }

  const newJti = uuidv7();
  const newRawRefreshToken = await signRefreshToken(decoded.sub, newJti);
  const payload = await buildTokenPayload(decoded.sub);
  const accessToken = await signAccessToken(payload);

  await rotateRefreshToken(stored.id, {
    id: newJti,
    userId: decoded.sub,
    tokenHash: hashToken(newRawRefreshToken),
    expiresAt: refreshTokenExpiresAt(),
  });

  return { accessToken, refreshToken: newRawRefreshToken };
}

export async function logout(rawRefreshToken: string): Promise<void> {
  try {
    await verify(rawRefreshToken, REFRESH_TOKEN_SECRET, "HS256");
  } catch {
    return;
  }

  const stored = await findRefreshTokenByHash(hashToken(rawRefreshToken));

  if (stored && stored.revokedAt === null) {
    await revokeRefreshToken(stored.id);
  }
}

export async function logoutAll(userId: string): Promise<void> {
  await revokeAllRefreshTokensByUserId(userId);
}