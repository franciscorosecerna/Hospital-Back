import { findRolesByUserId, findPermissionsByUserId } from "./authorizationRepository";

export interface TokenPayload {
  sub: string;
  roles: string[];
  permissions: string[];
}

export async function buildTokenPayload(userId: string): Promise<TokenPayload> {
  const [roles, permissions] = await Promise.all([
    findRolesByUserId(userId),
    findPermissionsByUserId(userId),
  ]);

  return {
    sub: userId,
    roles: roles.map((r) => r.nombre),
    permissions: permissions.map((p) => p.nombre),
  };
}

export async function userHasRole(userId: string, role: string): Promise<boolean> {
  const roles = await findRolesByUserId(userId);
  return roles.some((r) => r.nombre === role);
}

export async function userHasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  const permissions = await findPermissionsByUserId(userId);
  return permissions.some((p) => p.nombre === permission);
}

export async function userHasAllPermissions(
  userId: string,
  requiredPermissions: string[]
): Promise<boolean> {
  const permissions = await findPermissionsByUserId(userId);
  const permissionSet = new Set(permissions.map((p) => p.nombre));
  return requiredPermissions.every((p) => permissionSet.has(p));
}