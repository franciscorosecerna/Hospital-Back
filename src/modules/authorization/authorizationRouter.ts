import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createRoleSchema,
  createPermissionSchema,
  roleIdParamSchema,
  permissionIdParamSchema,
  roleNameParamSchema,
  permissionNameParamSchema,
  userRoleParamSchema,
  userIdParamSchema,
  rolePermissionParamSchema,
  roleIdOnlyParamSchema,
} from "./authorizationSchema";
import {
  createRole,
  getRoles,
  getRoleByIdController,
  getRoleByNameController,
  deleteRole,
  createPermission,
  getPermissions,
  getPermissionByIdController,
  getPermissionByNameController,
  deletePermission,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  assignPermissionToRole,
  removePermissionFromRole,
  getRolePermissions,
  getUserPermissions,
} from "./authorizationController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requirePermission } from "../../middleware/permissionMiddleware";

export const authorizationRouter = new Hono();

authorizationRouter.post(
  "/roles",
  authMiddleware,
  requirePermission("roles:write"),
  zValidator("json", createRoleSchema),
  createRole
);

authorizationRouter.get(
  "/roles",
  authMiddleware,
  requirePermission("roles:read"),
  getRoles
);

authorizationRouter.get(
  "/roles/:id",
  authMiddleware,
  requirePermission("roles:read"),
  zValidator("param", roleIdParamSchema),
  getRoleByIdController
);

authorizationRouter.get(
  "/roles/by-nombre/:nombre",
  authMiddleware,
  requirePermission("roles:read"),
  zValidator("param", roleNameParamSchema),
  getRoleByNameController
);

authorizationRouter.delete(
  "/roles/:id",
  authMiddleware,
  requirePermission("roles:delete"),
  zValidator("param", roleIdParamSchema),
  deleteRole
);

authorizationRouter.post(
  "/permissions",
  authMiddleware,
  requirePermission("permissions:write"),
  zValidator("json", createPermissionSchema),
  createPermission
);

authorizationRouter.get(
  "/permissions",
  authMiddleware,
  requirePermission("permissions:read"),
  getPermissions
);

authorizationRouter.get(
  "/permissions/:id",
  authMiddleware,
  requirePermission("permissions:read"),
  zValidator("param", permissionIdParamSchema),
  getPermissionByIdController
);

authorizationRouter.get(
  "/permissions/by-nombre/:nombre",
  authMiddleware,
  requirePermission("permissions:read"),
  zValidator("param", permissionNameParamSchema),
  getPermissionByNameController
);

authorizationRouter.delete(
  "/permissions/:id",
  authMiddleware,
  requirePermission("permissions:delete"),
  zValidator("param", permissionIdParamSchema),
  deletePermission
);

authorizationRouter.post(
  "/users/:userId/roles/:roleId",
  authMiddleware,
  requirePermission("roles:assign"),
  zValidator("param", userRoleParamSchema),
  assignRoleToUser
);

authorizationRouter.delete(
  "/users/:userId/roles/:roleId",
  authMiddleware,
  requirePermission("roles:assign"),
  zValidator("param", userRoleParamSchema),
  removeRoleFromUser
);

authorizationRouter.get(
  "/users/:userId/roles",
  authMiddleware,
  requirePermission("roles:read"),
  zValidator("param", userIdParamSchema),
  getUserRoles
);

authorizationRouter.get(
  "/users/:userId/permissions",
  authMiddleware,
  requirePermission("permissions:read"),
  zValidator("param", userIdParamSchema),
  getUserPermissions
);

authorizationRouter.post(
  "/roles/:roleId/permissions/:permissionId",
  authMiddleware,
  requirePermission("permissions:assign"),
  zValidator("param", rolePermissionParamSchema),
  assignPermissionToRole
);

authorizationRouter.delete(
  "/roles/:roleId/permissions/:permissionId",
  authMiddleware,
  requirePermission("permissions:assign"),
  zValidator("param", rolePermissionParamSchema),
  removePermissionFromRole
);

authorizationRouter.get(
  "/roles/:roleId/permissions",
  authMiddleware,
  requirePermission("permissions:read"),
  zValidator("param", roleIdOnlyParamSchema),
  getRolePermissions
);