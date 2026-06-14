import { createMiddleware } from "hono/factory";
import type { TokenPayload } from "../modules/authorization/authorizationService";

type AuthVariables = {
  user: TokenPayload;
};

export function requireRole(...roles: string[]) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.var.user;

    if (!user) {
      return c.json({ message: "No autenticado" }, 401);
    }

    const hasRole = roles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      return c.json(
        { message: `Se requiere uno de los siguientes roles: ${roles.join(", ")}` },
        403
      );
    }

    await next();
  });
}

export function requirePermission(...permissions: string[]) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.var.user;

    if (!user) {
      return c.json({ message: "No autenticado" }, 401);
    }

    const hasPermission = permissions.some((perm) => user.permissions.includes(perm));

    if (!hasPermission) {
      return c.json(
        { message: `Se requiere uno de los siguientes permisos: ${permissions.join(", ")}` },
        403
      );
    }

    await next();
  });
}

export function requireAllPermissions(...permissions: string[]) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.var.user;

    if (!user) {
      return c.json({ message: "No autenticado" }, 401);
    }

    const permissionSet = new Set(user.permissions);
    const missingPermissions = permissions.filter((p) => !permissionSet.has(p));

    if (missingPermissions.length > 0) {
      return c.json(
        { message: `Permisos faltantes: ${missingPermissions.join(", ")}` },
        403
      );
    }

    await next();
  });
}