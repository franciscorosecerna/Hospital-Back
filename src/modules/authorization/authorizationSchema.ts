import { z } from "zod";

export const createRoleSchema = z.object({
  nombre: z.string().min(1, "El nombre del rol es requerido").max(100),
});

export const createPermissionSchema = z.object({
  nombre: z.string().min(1, "El nombre del permiso es requerido").max(128),
});

export const roleIdParamSchema = z.object({
  id: z.uuid("El ID del rol debe ser un UUID válido"),
});

export const permissionIdParamSchema = z.object({
  id: z.uuid("El ID del permiso debe ser un UUID válido"),
});

export const roleNameParamSchema = z.object({
  nombre: z.string().min(1, "El nombre del rol es requerido"),
});

export const permissionNameParamSchema = z.object({
  nombre: z.string().min(1, "El nombre del permiso es requerido"),
});

export const userRoleParamSchema = z.object({
  userId: z.uuid("El ID de usuario debe ser un UUID válido"),
  roleId: z.uuid("El ID del rol debe ser un UUID válido"),
});

export const userIdParamSchema = z.object({
  userId: z.uuid("El ID de usuario debe ser un UUID válido"),
});

export const rolePermissionParamSchema = z.object({
  roleId: z.uuid("El ID del rol debe ser un UUID válido"),
  permissionId: z.uuid("El ID del permiso debe ser un UUID válido"),
});

export const roleIdOnlyParamSchema = z.object({
  roleId: z.uuid("El ID del rol debe ser un UUID válido"),
});

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  page: z.coerce.number().int().positive().optional().default(1),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type RoleIdParam = z.infer<typeof roleIdParamSchema>;
export type PermissionIdParam = z.infer<typeof permissionIdParamSchema>;
export type RoleNameParam = z.infer<typeof roleNameParamSchema>;
export type PermissionNameParam = z.infer<typeof permissionNameParamSchema>;
export type UserRoleParam = z.infer<typeof userRoleParamSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type RolePermissionParam = z.infer<typeof rolePermissionParamSchema>;
export type RoleIdOnlyParam = z.infer<typeof roleIdOnlyParamSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;