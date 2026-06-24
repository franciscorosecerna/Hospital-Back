import { pgTable, uuid, varchar, date, timestamp, unique, boolean } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    nombre: varchar("nombre", { length: 256 }).notNull(),
    apellido: varchar("apellido", { length: 256 }).notNull(),
    tipoDocumento: varchar("tipo_documento", { length: 32 }).notNull(),
    documento: varchar("documento", { length: 64 }).notNull(),
    fechaNacimiento: date("fecha_nacimiento").notNull(),
    password: varchar("password", { length: 256 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [unique("uq_users_documento").on(t.tipoDocumento, t.documento)]
);

export const doctors = pgTable("doctors", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id),
  matricula: varchar("matricula", { length: 128 }).notNull().unique(),
  especialidad: varchar("especialidad", { length: 128 }),
});

export const patients = pgTable("patients", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id),
  numeroHistoriaClinica: varchar("numero_historia_clinica", {
    length: 128,
  }).unique(),
  grupoSanguineo: varchar("grupo_sanguineo", { length: 16 }),
});

export const nurses = pgTable("nurses", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id),
  departmentId: uuid("department_id").notNull(),
  turno: varchar("turno", { length: 64 }).notNull(),
});