import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import type { TokenPayload } from "../modules/authorization/authorizationService";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET no configurado");
}

type AuthVariables = {
  user: TokenPayload;
};

export const authMiddleware = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ message: "Token de acceso requerido" }, 401);
  }

  const token = authHeader.slice(7);

  let payload: TokenPayload;

  try {
    payload = await verify(token, ACCESS_TOKEN_SECRET, "HS256") as unknown as TokenPayload;
  } catch {
    return c.json({ message: "Token inválido o expirado" }, 401);
  }

  if (
    typeof payload.sub !== "string" ||
    !Array.isArray(payload.roles) ||
    !payload.roles.every(r => typeof r === "string") ||
    !Array.isArray(payload.permissions) ||
    !payload.permissions.every(p => typeof p === "string")
  ) {
    return c.json({ message: "Token malformado" }, 401);
  }

  c.set("user", payload);

  await next();
});