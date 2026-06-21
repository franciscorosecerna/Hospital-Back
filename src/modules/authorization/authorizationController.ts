import type { Context } from "hono";
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

export async function createRole(c: Context) {
  const input = c.req.valid("json" as never);
  const role = await createRoleService(input);
  return c.json(role, 201);
}

export async function getRoles(c: Context) {
  const limit = Number(c.req.query("limit") ?? 50);
  const page = Number(c.req.query("page") ?? 1);
  const roles = await listRolesService(limit, page);
  return c.json(roles);
}

export async function getRoleByIdController(c: Context) {
  const { id } = c.req.valid("param" as never);
  const role = await getRoleById(id);
  return c.json(role);
}

export async function getRoleByNameController(c: Context) {
  const { nombre } = c.req.valid("param" as never);
  const role = await getRoleByName(nombre);
  return c.json(role);
}

export async function deleteRole(c: Context) {
  const { id } = c.req.valid("param" as never);
  await deleteRoleService(id);
  return c.json({ message: "Rol eliminado correctamente." });
}

export async function createPermission(c: Context) {
  const input = c.req.valid("json" as never);
  const permission = await createPermissionService(input);
  return c.json(permission, 201);
}

export async function getPermissions(c: Context) {
  const limit = Number(c.req.query("limit") ?? 50);
  const page = Number(c.req.query("page") ?? 1);
  const permissions = await listPermissionsService(limit, page);
  return c.json(permissions);
}

export async function getPermissionByIdController(c: Context) {
  const { id } = c.req.valid("param" as never);
  const permission = await getPermissionById(id);
  return c.json(permission);
}

export async function getPermissionByNameController(c: Context) {
  const { nombre } = c.req.valid("param" as never);
  const permission = await getPermissionByName(nombre);
  return c.json(permission);
}

export async function deletePermission(c: Context) {
  const { id } = c.req.valid("param" as never);
  await deletePermissionService(id);
  return c.json({ message: "Permiso eliminado correctamente." });
}

export async function assignRoleToUser(c: Context) {
  const { userId, roleId } = c.req.valid("param" as never);
  await assignRoleToUserService(userId, roleId);
  return c.json({ message: "Rol asignado correctamente." }, 201);
}

export async function removeRoleFromUser(c: Context) {
  const { userId, roleId } = c.req.valid("param" as never);
  await removeRoleFromUserService(userId, roleId);
  return c.json({ message: "Rol removido correctamente." });
}

export async function getUserRoles(c: Context) {
  const { userId } = c.req.valid("param" as never);
  const roles = await getRolesByUserId(userId);
  return c.json(roles);
}

export async function assignPermissionToRole(c: Context) {
  const { roleId, permissionId } = c.req.valid("param" as never);
  await assignPermissionToRoleService(roleId, permissionId);
  return c.json({ message: "Permiso asignado correctamente." }, 201);
}

export async function removePermissionFromRole(c: Context) {
  const { roleId, permissionId } = c.req.valid("param" as never);
  await removePermissionFromRoleService(roleId, permissionId);
  return c.json({ message: "Permiso removido correctamente." });
}

export async function getRolePermissions(c: Context) {
  const { roleId } = c.req.valid("param" as never);
  const permissions = await getPermissionsByRoleId(roleId);
  return c.json(permissions);
}

export async function getUserPermissions(c: Context) {
  const { userId } = c.req.valid("param" as never);
  const permissions = await getPermissionsByUserId(userId);
  return c.json(permissions);
}