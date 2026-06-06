import { db } from "../../db/client";
import { roles, permissions, userRoles, rolePermissions } from "../../db/schema/auth";
import { eq, and} from "drizzle-orm";
import { parsePgError, RecordNotFoundException } from "../../db/exceptions";

export type NewRole = typeof roles.$inferInsert;
export type Role = typeof roles.$inferSelect;

export type NewPermission = typeof permissions.$inferInsert;
export type Permission = typeof permissions.$inferSelect;

export async function createRole(data: NewRole): Promise<Role> {
  try {
    const [role] = await db.insert(roles).values(data).returning();
    if (!role) throw new Error("Failed to create role");
    return role;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function findRoleById(id: string): Promise<Role | undefined> {
  try {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
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
      .where(eq(roles.nombre, nombre))
      .limit(1);

    return role;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function listRoles(): Promise<Role[]> {
  try {
    return await db.select().from(roles);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteRole(id: string): Promise<void> {
  try {
    const result = await db
      .delete(roles)
      .where(eq(roles.id, id))
      .returning({ id: roles.id });

    if (result.length === 0) {
      throw new RecordNotFoundException("roles", id);
    }
  } catch (err) {
    if (err instanceof RecordNotFoundException) throw err;
    throw parsePgError(err);
  }
}

export async function createPermission(data: NewPermission): Promise<Permission> {
  try {
    const [permission] = await db.insert(permissions).values(data).returning();
    if (!permission) throw new Error("Failed to create permission");
    return permission;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function findPermissionById(id: string): Promise<Permission | undefined> {
  try {
    const [permission] = await db
      .select()
      .from(permissions)
      .where(eq(permissions.id, id))
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
      .where(eq(permissions.nombre, nombre))
      .limit(1);

    return permission;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function listPermissions(): Promise<Permission[]> {
  try {
    return await db.select().from(permissions);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deletePermission(id: string): Promise<void> {
  try {
    const result = await db
      .delete(permissions)
      .where(eq(permissions.id, id))
      .returning({ id: permissions.id });

    if (result.length === 0) {
      throw new RecordNotFoundException("permissions", id);
    }
  } catch (err) {
    if (err instanceof RecordNotFoundException) throw err;
    throw parsePgError(err);
  }
}

export async function assignRoleToUser(userId: string, roleId: string): Promise<void> {
  try {
    await db.insert(userRoles).values({ userId, roleId }).onConflictDoNothing();
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function removeRoleFromUser(userId: string, roleId: string): Promise<void> {
  try {
    await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
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
      .where(eq(userRoles.userId, userId));

    return rows.map((r) => r.role);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
  try {
    await db
      .insert(rolePermissions)
      .values({ roleId, permissionId })
      .onConflictDoNothing();
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
  try {
    await db
      .delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.permissionId, permissionId)
        )
      );
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
      .where(eq(rolePermissions.roleId, roleId));

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
    .innerJoin(
        rolePermissions,
        eq(userRoles.roleId, rolePermissions.roleId)
    )
    .innerJoin(
        permissions,
        eq(rolePermissions.permissionId, permissions.id)
    )
    .where(eq(userRoles.userId, userId));

    return rows.map((r) => r.permission);
  } catch (err) {
    throw parsePgError(err);
  }
}