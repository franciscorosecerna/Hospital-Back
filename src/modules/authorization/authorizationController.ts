import type { ValidatedContext } from "../../utils/validator";
import type {
  CreatePermissionInput,
  CreateRoleInput,
  PaginationQuery,
  PermissionIdParam,
  PermissionNameParam,
  RoleIdOnlyParam,
  RoleIdParam,
  RoleNameParam,
  RolePermissionParam,
  UserIdParam,
  UserRoleParam,
} from "./authorizationSchema";
import {
  createRoleService,
  getRoleById,
  getRoleByName,
  listRolesService,
  deleteRoleService,
  createPermissionService,
  getPermissionById,
  getPermissionByName,
  listPermissionsService,
  deletePermissionService,
  assignRoleToUserService,
  removeRoleFromUserService,
  getRolesByUserId,
  assignPermissionToRoleService,
  removePermissionFromRoleService,
  getPermissionsByRoleId,
  getPermissionsByUserId,
} from "./authorizationService";

export async function createRole(c: ValidatedContext<CreateRoleInput>) {
  const input = c.req.valid("json");
  const user = c.get("user").sub;
  const role = await createRoleService(input, user);
  return c.json(role, 201);
}

export async function getRoles(c: ValidatedContext<unknown, unknown, PaginationQuery>) {
  const { limit, page } = c.req.valid("query");
  const roles = await listRolesService(limit, page);
  return c.json(roles);
}

export async function getRoleByIdController(c: ValidatedContext<unknown, RoleIdParam>) {
  const { id } = c.req.valid("param");
  const role = await getRoleById(id);
  return c.json(role);
}

export async function getRoleByNameController(c: ValidatedContext<unknown, RoleNameParam>) {
  const { nombre } = c.req.valid("param");
  const role = await getRoleByName(nombre);
  return c.json(role);
}

export async function deleteRole(c: ValidatedContext<unknown, RoleIdParam>) {
  const { id } = c.req.valid("param");
  const user = c.get("user").sub;
  await deleteRoleService(id, user);
  return c.json({ message: "Rol eliminado correctamente." });
}

export async function createPermission(c: ValidatedContext<CreatePermissionInput>) {
  const input = c.req.valid("json");
  const user = c.get("user").sub;
  const permission = await createPermissionService(input, user);
  return c.json(permission, 201);
}

export async function getPermissions(c: ValidatedContext<unknown, unknown, PaginationQuery>) {
  const { limit, page } = c.req.valid("query");
  const permissions = await listPermissionsService(limit, page);
  return c.json(permissions);
}

export async function getPermissionByIdController(c: ValidatedContext<unknown, PermissionIdParam>) {
  const { id } = c.req.valid("param");
  const permission = await getPermissionById(id);
  return c.json(permission);
}

export async function getPermissionByNameController(c: ValidatedContext<unknown, PermissionNameParam>) {
  const { nombre } = c.req.valid("param");
  const permission = await getPermissionByName(nombre);
  return c.json(permission);
}

export async function deletePermission(c: ValidatedContext<unknown, PermissionIdParam>) {
  const { id } = c.req.valid("param");
  const user = c.get("user").sub;
  await deletePermissionService(id, user);
  return c.json({ message: "Permiso eliminado correctamente." });
}

export async function assignRoleToUser(c: ValidatedContext<unknown, UserRoleParam>) {
  const { userId, roleId } = c.req.valid("param");
  const user = c.get("user").sub;
  await assignRoleToUserService(userId, roleId, user);
  return c.json({ message: "Rol asignado correctamente." }, 201);
}

export async function removeRoleFromUser(c: ValidatedContext<unknown, UserRoleParam>) {
  const { userId, roleId } = c.req.valid("param");
  const user = c.get("user").sub;
  await removeRoleFromUserService(userId, roleId, user);
  return c.json({ message: "Rol removido correctamente." });
}

export async function getUserRoles(c: ValidatedContext<unknown, UserIdParam>) {
  const { userId } = c.req.valid("param");
  const roles = await getRolesByUserId(userId);
  return c.json(roles);
}

export async function assignPermissionToRole(c: ValidatedContext<unknown, RolePermissionParam>) {
  const { roleId, permissionId } = c.req.valid("param");
  const user = c.get("user").sub;
  await assignPermissionToRoleService(roleId, permissionId, user);
  return c.json({ message: "Permiso asignado correctamente." }, 201);
}

export async function removePermissionFromRole(c: ValidatedContext<unknown, RolePermissionParam>) {
  const { roleId, permissionId } = c.req.valid("param");
  const user = c.get("user").sub;
  await removePermissionFromRoleService(roleId, permissionId, user);
  return c.json({ message: "Permiso removido correctamente." });
}

export async function getRolePermissions(c: ValidatedContext<unknown, RoleIdOnlyParam>) {
  const { roleId } = c.req.valid("param");
  const permissions = await getPermissionsByRoleId(roleId);
  return c.json(permissions);
}

export async function getUserPermissions(c: ValidatedContext<unknown, UserIdParam>) {
  const { userId } = c.req.valid("param");
  const permissions = await getPermissionsByUserId(userId);
  return c.json(permissions);
}