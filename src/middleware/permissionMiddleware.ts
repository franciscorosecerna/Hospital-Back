import { createMiddleware } from "hono/factory";
import type { TokenPayload } from "../modules/authorization/authorizationService";
import { ForbiddenException, InvalidCredentialsException} from "../utils/exceptions";

type AuthVariables = {
  user: TokenPayload;
};

export function requireRole(...roles: string[]) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.var.user;

    if (!user) throw new InvalidCredentialsException();

    const hasRole = roles.some((role) => user.roles.includes(role));

    if (!hasRole) throw new ForbiddenException();

    await next();
  });
}

export function requirePermission(...permissions: string[]) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.var.user;

    if (!user) throw new InvalidCredentialsException();

    const hasPermission = permissions.some((perm) => user.permissions.includes(perm));

    if (!hasPermission) throw new ForbiddenException();

    await next();
  });
}

export function requireAllPermissions(...permissions: string[]) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.var.user;

    if (!user) throw new InvalidCredentialsException();

    const permissionSet = new Set(user.permissions);
    const missingPermissions = permissions.filter((p) => !permissionSet.has(p));

    if (missingPermissions.length > 0) throw new ForbiddenException();

    await next();
  });
}