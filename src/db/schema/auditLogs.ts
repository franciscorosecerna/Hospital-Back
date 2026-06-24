import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tableName: varchar("table_name", { length: 100 }).notNull(),
  recordId: uuid("record_id").notNull(),
  action: varchar("action", { length: 50 }).notNull(), // "created" | "updated" | "deleted"
  previousData: jsonb("previous_data"),
  newData: jsonb("new_data"),
  performedBy: uuid("performed_by").references(() => users.id),
  performedAt: timestamp("performed_at").notNull().defaultNow(),
});