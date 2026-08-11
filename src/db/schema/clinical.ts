import { pgTable, uuid, varchar, timestamp, date, boolean, unique } from "drizzle-orm/pg-core";
import { doctors, patients } from "./users";
import { sql } from "drizzle-orm";

export const doctorPatients = pgTable("doctor_patients", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctors.userId),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.userId),
  fechaAsignacion: date("fecha_asignacion",).notNull().defaultNow(),
  fechaFinalizacion: date("fecha_finalizacion"),
});

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.userId),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => doctors.userId),
    fechaHora: timestamp("fecha_hora", { withTimezone: true }).notNull().defaultNow(),
    motivo: varchar("motivo", { length: 512 }),
    // Estados: Pendiente | Confirmada | Cancelada | Completada
    estado: varchar("estado", { length: 32 }).notNull().default("Pendiente"),
    notas: varchar("notas", { length: 1024 }),
  },
  (t) => [unique("uq_appointment_doctor_time").on(t.doctorId, t.fechaHora)]
);

export const diagnoses = pgTable("diagnoses", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.userId),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctors.userId),
  // Código CIE-10 opcional
  codigo: varchar("codigo", { length: 16 }),
  descripcion: varchar("descripcion", { length: 512 }).notNull(),
  fechaRegistro: timestamp("fecha_registro", { withTimezone: true }).notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const allergies = pgTable(
  "allergies",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.userId),
    sustancia: varchar("sustancia", { length: 256 }).notNull(),
    // Severidad: Leve | Moderada | Grave
    severidad: varchar("severidad", { length: 32 }).notNull(),
    reaccion: varchar("reaccion", { length: 512 }),
    fechaRegistro: timestamp("fecha_registro", { withTimezone: true }).notNull().defaultNow(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [unique("uq_allergy").on(t.patientId, t.sustancia)]
);

export const procedures = pgTable("procedures", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.userId),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctors.userId),
  nombre: varchar("nombre", { length: 256 }).notNull(),
  descripcion: varchar("descripcion", { length: 1024 }),
  fechaHora: timestamp("fecha_hora", { withTimezone: true }).notNull(),
  resultado: varchar("resultado", { length: 512 }),
  isActive: boolean("is_active").notNull().default(true),
});