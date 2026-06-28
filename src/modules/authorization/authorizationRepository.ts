import { db } from "../../db/client";
import { roles, permissions, userRoles, rolePermissions } from "../../db/schema/auth";
import { eq, and } from "drizzle-orm";
import { parsePgError, RecordNotFoundException } from "../../utils/exceptions";
import { insertAuditLogTx } from "../auditLogs/auditLogRepository";

export type NewRole = typeof roles.$inferInsert;
export type Role = typeof roles.$inferSelect;

export type NewPermission = typeof permissions.$inferInsert;
export type Permission = typeof permissions.$inferSelect;

export const activeRole = eq(roles.isActive, true);
export const activePermission = eq(permissions.isActive, true);

export async function createRole(data: NewRole, performedBy?: string): Promise<Role> {
  try {
    return await db.transaction(async (tx) => {
      const [role] = await tx.insert(roles).values(data).returning();
      if (!role) throw new Error("Failed to create role");
      await insertAuditLogTx(tx, "created", "roles", role.id, undefined, role, performedBy);
      return role;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function findRoleById(id: string): Promise<Role | undefined> {
  try {
    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.id, id), activeRole))
      .limit(1);
    return role;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function findRoleByName(nombre: string): Promise<Role | undefined> {
  try {
    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.nombre, nombre), activeRole))
      .limit(1);
    return role;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function listRoles(limit: number = 50, offset: number = 0): Promise<Role[]> {
  try {
    return await db.select().from(roles).where(activeRole).limit(limit).offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteRole(id: string, performedBy?: string): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .update(roles)
        .set({ isActive: false })
        .where(and(eq(roles.id, id), activeRole))
        .returning();
      if (!deleted) throw new RecordNotFoundException("roles", id);
      await insertAuditLogTx(tx, "deleted", "roles", id, deleted, undefined, performedBy);
    });
  } catch (err) {
    if (err instanceof RecordNotFoundException) throw err;
    throw parsePgError(err);
  }
}

export async function createPermission(data: NewPermission, performedBy?: string): Promise<Permission> {
  try {
    return await db.transaction(async (tx) => {
      const [permission] = await tx.insert(permissions).values(data).returning();
      if (!permission) throw new Error("Failed to create permission");
      await insertAuditLogTx(tx, "created", "permissions", permission.id, undefined, permission, performedBy);
      return permission;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function findPermissionById(id: string): Promise<Permission | undefined> {
  try {
    const [permission] = await db
      .select()
      .from(permissions)
      .where(and(eq(permissions.id, id), activePermission))
      .limit(1);
    return permission;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function findPermissionByName(nombre: string): Promise<Permission | undefined> {
  try {
    const [permission] = await db
      .select()
      .from(permissions)
      .where(and(eq(permissions.nombre, nombre), activePermission))
      .limit(1);
    return permission;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function listPermissions(limit: number = 50, offset: number = 0): Promise<Permission[]> {
  try {
    return await db.select().from(permissions).where(activePermission).limit(limit).offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deletePermission(id: string, performedBy?: string): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .update(permissions)
        .set({ isActive: false })
        .where(and(eq(permissions.id, id), activePermission))
        .returning();
      if (!deleted) throw new RecordNotFoundException("permissions", id);
      await insertAuditLogTx(tx, "deleted", "permissions", id, deleted, undefined, performedBy);
    });
  } catch (err) {
    if (err instanceof RecordNotFoundException) throw err;
    throw parsePgError(err);
  }
}

export async function assignRoleToUser(
  userId: string,
  roleId: string,
  performedBy?: string
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(userRoles).values({ userId, roleId }).onConflictDoNothing();
      await insertAuditLogTx(
        tx, "created", "user_roles",
        userId,
        undefined,
        { userId, roleId },
        performedBy
      );
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function removeRoleFromUser(
  userId: string,
  roleId: string,
  performedBy?: string
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(userRoles)
        .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
      await insertAuditLogTx(
        tx, "deleted", "user_roles",
        userId,
        { userId, roleId },
        undefined,
        performedBy
      );
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function findRolesByUserId(userId: string): Promise<Role[]> {
  try {
    const rows = await db
      .select({ role: roles })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(eq(userRoles.userId, userId), activeRole));
    return rows.map((r) => r.role);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function assignPermissionToRole(
  roleId: string,
  permissionId: string,
  performedBy?: string
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(rolePermissions)
        .values({ roleId, permissionId })
        .onConflictDoNothing();
      await insertAuditLogTx(
        tx, "created", "role_permissions",
        roleId,
        undefined,
        { roleId, permissionId },
        performedBy
      );
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function removePermissionFromRole(
  roleId: string,
  permissionId: string,
  performedBy?: string
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleId),
            eq(rolePermissions.permissionId, permissionId)
          )
        );
      await insertAuditLogTx(
        tx, "deleted", "role_permissions",
        roleId,
        { roleId, permissionId },
        undefined,
        performedBy
      );
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function findPermissionsByRoleId(roleId: string): Promise<Permission[]> {
  try {
    const rows = await db
      .select({ permission: permissions })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(and(eq(rolePermissions.roleId, roleId), activePermission));
    return rows.map((r) => r.permission);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function findPermissionsByUserId(userId: string): Promise<Permission[]> {
  try {
    const rows = await db
      .selectDistinct({ permission: permissions })
      .from(userRoles)
      .innerJoin(roles, and(eq(userRoles.roleId, roles.id), activeRole))
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, and(eq(rolePermissions.permissionId, permissions.id), activePermission))
      .where(eq(userRoles.userId, userId));
    return rows.map((r) => r.permission);
  } catch (err) {
    throw parsePgError(err);
  }
}