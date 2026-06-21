import {
  findRolesByUserId,
  findPermissionsByUserId,
  createRole,
  findRoleById,
  findRoleByName,
  listRoles,
  deleteRole,
  createPermission,
  findPermissionById,
  findPermissionByName,
  listPermissions,
  deletePermission,
  assignRoleToUser,
  removeRoleFromUser,
  assignPermissionToRole,
  removePermissionFromRole,
  findPermissionsByRoleId,
  type NewRole,
  type Role,
  type NewPermission,
  type Permission,
} from "./authorizationRepository";

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

export async function createRoleService(data: NewRole): Promise<Role> {
  return createRole(data);
}

export async function getRoleById(id: string): Promise<Role | undefined> {
  return findRoleById(id);
}

export async function getRoleByName(nombre: string): Promise<Role | undefined> {
  return findRoleByName(nombre);
}

export async function listRolesService(
  limit: number = 50,
  page: number = 1
): Promise<Role[]> {
  const offset = limit * (page - 1);
  return listRoles(limit, offset);
}

export async function deleteRoleService(id: string): Promise<void> {
  return deleteRole(id);
}

export async function createPermissionService(data: NewPermission): Promise<Permission> {
  return createPermission(data);
}

export async function getPermissionById(id: string): Promise<Permission | undefined> {
  return findPermissionById(id);
}

export async function getPermissionByName(nombre: string): Promise<Permission | undefined> {
  return findPermissionByName(nombre);
}

export async function listPermissionsService(
  limit: number = 50,
  page: number = 1
): Promise<Permission[]> {
  const offset = limit * (page - 1);
  return listPermissions(limit, offset);
}

export async function deletePermissionService(id: string): Promise<void> {
  return deletePermission(id);
}

export async function assignRoleToUserService(userId: string, roleId: string): Promise<void> {
  return assignRoleToUser(userId, roleId);
}

export async function removeRoleFromUserService(userId: string, roleId: string): Promise<void> {
  return removeRoleFromUser(userId, roleId);
}

export async function getRolesByUserId(userId: string): Promise<Role[]> {
  return findRolesByUserId(userId);
}

export async function assignPermissionToRoleService(roleId: string, permissionId: string): Promise<void> {
  return assignPermissionToRole(roleId, permissionId);
}

export async function removePermissionFromRoleService(roleId: string, permissionId: string): Promise<void> {
  return removePermissionFromRole(roleId, permissionId);
}

export async function getPermissionsByRoleId(roleId: string): Promise<Permission[]> {
  return findPermissionsByRoleId(roleId);
}

export async function getPermissionsByUserId(userId: string): Promise<Permission[]> {
  return findPermissionsByUserId(userId);
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