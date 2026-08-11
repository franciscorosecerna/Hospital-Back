import { pgTable, uuid, varchar, integer, timestamp, unique, index } from "drizzle-orm/pg-core";
import { patients } from "./users";
import { sql } from "drizzle-orm";
  
export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  nombre: varchar("nombre", { length: 100 }).notNull().unique(),
});

export const floors = pgTable(
  "floors",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    numero: integer("numero").notNull(),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id),
  },
  (t) => [unique("uq_floor").on(t.departmentId, t.numero)]
);

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    numero: integer("numero").notNull(),
    floorId: uuid("floor_id")
      .notNull()
      .references(() => floors.id),
  },
  (t) => [unique("uq_room").on(t.floorId, t.numero)]
);

export const beds = pgTable(
  "beds",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id),
    numero: integer("numero").notNull(),
  },
  (t) => [unique("uq_bed").on(t.roomId, t.numero)]
);

export const bedAssignments = pgTable("bed_assignments", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  bedId: uuid("bed_id")
    .notNull()
    .references(() => beds.id),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.userId),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
});