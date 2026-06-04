import { pgTable, uuid, varchar, timestamp, text, unique, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { doctors, patients } from "./users";
import { appointments } from "./clinical";

export const certificateAuthorities = pgTable("certificate_authorities", {
  id: uuid("id").primaryKey(),
  nombre: varchar("nombre", { length: 256 }).notNull().unique(),
  // Certificado raíz X.509 en PEM
  certificadoRaiz: text("certificado_raiz").notNull(),
  crlEndpoint: varchar("crl_endpoint", { length: 512 }),
  ocspEndpoint: varchar("ocsp_endpoint", { length: 512 }),
  validoDesde: timestamp("valido_desde").notNull(),
  validoHasta: timestamp("valido_hasta").notNull(),
});

export const doctorCertificates = pgTable("doctor_certificates", {
  id: uuid("id").primaryKey(),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctors.userId),
  caId: uuid("ca_id")
    .notNull()
    .references(() => certificateAuthorities.id),
  // Certificado X.509 en PEM
  certificadoPublico: text("certificado_publico").notNull(),
  numeroSerie: varchar("numero_serie", { length: 256 }).notNull().unique(),
  validoDesde: timestamp("valido_desde").notNull(),
  validoHasta: timestamp("valido_hasta").notNull(),
  revokedAt: timestamp("revoked_at"),
  motivoRevocacion: varchar("motivo_revocacion", { length: 256 }),
});

export const medications = pgTable("medications", {
  id: uuid("id").primaryKey(),
  nombre: varchar("nombre", { length: 256 }).notNull().unique(),
  descripcion: varchar("descripcion", { length: 512 }),
  // ej: "Comprimido 500mg", "Jarabe 250ml"
  presentacion: varchar("presentacion", { length: 128 }),
});

export const prescriptions = pgTable(
  "prescriptions",
  {
    id: uuid("id").primaryKey(),
    appointmentId: uuid("appointment_id")
      .notNull()
      .unique()
      .references(() => appointments.id),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => doctors.userId),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.userId),
    fechaEmision: timestamp("fecha_emision").notNull().defaultNow(),
    observaciones: varchar("observaciones", { length: 1024 }),
    estado: varchar("estado", { length: 32 }).notNull().default("Borrador"),
    certificateId: uuid("certificate_id").references(
      () => doctorCertificates.id
    ),
    firmadaAt: timestamp("firmada_at"),
    documentHash: varchar("document_hash", { length: 512 }),
    signature: text("signature"),
    signatureAlgorithm: varchar("signature_algorithm", { length: 64 }),
    anuladaAt: timestamp("anulada_at"),
    motivoAnulacion: varchar("motivo_anulacion", { length: 512 }),
    anuladaPorDoctorId: uuid("anulada_por_doctor_id").references(
      () => doctors.userId
    ),
  },
  (t) => [
    // Si está Firmada, todos los campos de firma deben estar presentes
    check(
      "chk_firma",
      sql`(${t.estado} != 'Firmada') OR (
        ${t.certificateId} IS NOT NULL AND
        ${t.firmadaAt}     IS NOT NULL AND
        ${t.documentHash}  IS NOT NULL AND
        ${t.signature}     IS NOT NULL
      )`
    ),
    // Si está Anulada, debe tener motivo y responsable
    check(
      "chk_anulacion",
      sql`(${t.estado} != 'Anulada') OR (
        ${t.anuladaAt}           IS NOT NULL AND
        ${t.motivoAnulacion}     IS NOT NULL AND
        ${t.anuladaPorDoctorId}  IS NOT NULL
      )`
    ),
  ]
);

export const prescriptionItems = pgTable(
  "prescription_items",
  {
    id: uuid("id").primaryKey(),
    prescriptionId: uuid("prescription_id")
      .notNull()
      .references(() => prescriptions.id),
    medicationId: uuid("medication_id")
      .notNull()
      .references(() => medications.id),
    dosis: varchar("dosis", { length: 128 }).notNull(),
    frecuencia: varchar("frecuencia", { length: 128 }).notNull(),
    duracion: varchar("duracion", { length: 128 }).notNull(),
    indicaciones: varchar("indicaciones", { length: 512 }),
  },
  (t) => [unique("uq_prescription_item").on(t.prescriptionId, t.medicationId)]
);

export const signatureVerifications = pgTable("signature_verifications", {
  id: uuid("id").primaryKey(),
  prescriptionId: uuid("prescription_id")
    .notNull()
    .references(() => prescriptions.id),
  // NULL si es verificación externa/anónima
  verificadoPorUserId: uuid("verificado_por_user_id"),
  verificadoAt: timestamp("verificado_at").notNull().defaultNow(),
  // Resultados: Valida | Invalida | CertificadoExpirado | Revocado
  resultado: varchar("resultado", { length: 32 }).notNull(),
  detalle: varchar("detalle", { length: 512 }),
  ipOrigen: varchar("ip_origen", { length: 64 }),
});