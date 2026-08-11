import { pgTable, uuid, varchar, timestamp, primaryKey, boolean} from "drizzle-orm/pg-core";
import { users } from "./users";
import { sql } from "drizzle-orm";

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  nombre: varchar("nombre", { length: 100 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
});

export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  nombre: varchar("nombre", { length: 128 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
});

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })]
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })]
);

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  tokenHash: varchar("token_hash", { length: 128 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true })
});