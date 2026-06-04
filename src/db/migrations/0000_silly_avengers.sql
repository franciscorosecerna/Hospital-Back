CREATE TABLE "nurses" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"department_id" uuid NOT NULL,
	"turno" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nombre" varchar(128) NOT NULL,
	CONSTRAINT "permissions_nombre_unique" UNIQUE("nombre")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	CONSTRAINT "roles_nombre_unique" UNIQUE("nombre")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "allergies" (
	"id" uuid PRIMARY KEY NOT NULL,
	"patient_id" uuid NOT NULL,
	"sustancia" varchar(256) NOT NULL,
	"severidad" varchar(32) NOT NULL,
	"reaccion" varchar(512),
	"fecha_registro" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_allergy" UNIQUE("patient_id","sustancia")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"fecha_hora" timestamp NOT NULL,
	"motivo" varchar(512),
	"estado" varchar(32) DEFAULT 'Pendiente' NOT NULL,
	"notas" varchar(1024),
	CONSTRAINT "uq_appointment_doctor_time" UNIQUE("doctor_id","fecha_hora")
);
--> statement-breakpoint
CREATE TABLE "diagnoses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid,
	"doctor_id" uuid NOT NULL,
	"codigo" varchar(16),
	"descripcion" varchar(512) NOT NULL,
	"fecha_registro" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctor_patients" (
	"id" uuid PRIMARY KEY NOT NULL,
	"doctor_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"fecha_asignacion" date DEFAULT 'now()' NOT NULL,
	"fecha_finalizacion" date
);
--> statement-breakpoint
CREATE TABLE "procedures" (
	"id" uuid PRIMARY KEY NOT NULL,
	"patient_id" uuid NOT NULL,
	"appointment_id" uuid,
	"doctor_id" uuid NOT NULL,
	"nombre" varchar(256) NOT NULL,
	"descripcion" varchar(1024),
	"fecha_hora" timestamp NOT NULL,
	"resultado" varchar(512)
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"matricula" varchar(128) NOT NULL,
	"especialidad" varchar(128),
	CONSTRAINT "doctors_matricula_unique" UNIQUE("matricula")
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"numero_historia_clinica" varchar(128),
	"grupo_sanguineo" varchar(16),
	CONSTRAINT "patients_numero_historia_clinica_unique" UNIQUE("numero_historia_clinica")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nombre" varchar(256) NOT NULL,
	"apellido" varchar(256) NOT NULL,
	"tipo_documento" varchar(32) NOT NULL,
	"documento" varchar(64) NOT NULL,
	"fecha_nacimiento" date NOT NULL,
	CONSTRAINT "uq_users_documento" UNIQUE("tipo_documento","documento")
);
--> statement-breakpoint
CREATE TABLE "bed_assignments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"bed_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "beds" (
	"id" uuid PRIMARY KEY NOT NULL,
	"room_id" uuid NOT NULL,
	"numero" integer NOT NULL,
	CONSTRAINT "uq_bed" UNIQUE("room_id","numero")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nombre" varchar(100) NOT NULL,
	CONSTRAINT "departments_nombre_unique" UNIQUE("nombre")
);
--> statement-breakpoint
CREATE TABLE "floors" (
	"id" uuid PRIMARY KEY NOT NULL,
	"numero" integer NOT NULL,
	"department_id" uuid NOT NULL,
	CONSTRAINT "uq_floor" UNIQUE("department_id","numero")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY NOT NULL,
	"numero" integer NOT NULL,
	"floor_id" uuid NOT NULL,
	CONSTRAINT "uq_room" UNIQUE("floor_id","numero")
);
--> statement-breakpoint
CREATE TABLE "certificate_authorities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nombre" varchar(256) NOT NULL,
	"certificado_raiz" text NOT NULL,
	"crl_endpoint" varchar(512),
	"ocsp_endpoint" varchar(512),
	"valido_desde" timestamp NOT NULL,
	"valido_hasta" timestamp NOT NULL,
	CONSTRAINT "certificate_authorities_nombre_unique" UNIQUE("nombre")
);
--> statement-breakpoint
CREATE TABLE "doctor_certificates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"doctor_id" uuid NOT NULL,
	"ca_id" uuid NOT NULL,
	"certificado_publico" text NOT NULL,
	"numero_serie" varchar(256) NOT NULL,
	"valido_desde" timestamp NOT NULL,
	"valido_hasta" timestamp NOT NULL,
	"revoked_at" timestamp,
	"motivo_revocacion" varchar(256),
	CONSTRAINT "doctor_certificates_numero_serie_unique" UNIQUE("numero_serie")
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nombre" varchar(256) NOT NULL,
	"descripcion" varchar(512),
	"presentacion" varchar(128),
	CONSTRAINT "medications_nombre_unique" UNIQUE("nombre")
);
--> statement-breakpoint
CREATE TABLE "prescription_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"prescription_id" uuid NOT NULL,
	"medication_id" uuid NOT NULL,
	"dosis" varchar(128) NOT NULL,
	"frecuencia" varchar(128) NOT NULL,
	"duracion" varchar(128) NOT NULL,
	"indicaciones" varchar(512),
	CONSTRAINT "uq_prescription_item" UNIQUE("prescription_id","medication_id")
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"appointment_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"fecha_emision" timestamp DEFAULT now() NOT NULL,
	"observaciones" varchar(1024),
	"estado" varchar(32) DEFAULT 'Borrador' NOT NULL,
	"certificate_id" uuid,
	"firmada_at" timestamp,
	"document_hash" varchar(512),
	"signature" text,
	"signature_algorithm" varchar(64),
	"anulada_at" timestamp,
	"motivo_anulacion" varchar(512),
	"anulada_por_doctor_id" uuid,
	CONSTRAINT "prescriptions_appointment_id_unique" UNIQUE("appointment_id"),
	CONSTRAINT "chk_firma" CHECK (("prescriptions"."estado" != 'Firmada') OR (
        "prescriptions"."certificate_id" IS NOT NULL AND
        "prescriptions"."firmada_at"     IS NOT NULL AND
        "prescriptions"."document_hash"  IS NOT NULL AND
        "prescriptions"."signature"     IS NOT NULL
      )),
	CONSTRAINT "chk_anulacion" CHECK (("prescriptions"."estado" != 'Anulada') OR (
        "prescriptions"."anulada_at"           IS NOT NULL AND
        "prescriptions"."motivo_anulacion"     IS NOT NULL AND
        "prescriptions"."anulada_por_doctor_id"  IS NOT NULL
      ))
);
--> statement-breakpoint
CREATE TABLE "signature_verifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"prescription_id" uuid NOT NULL,
	"verificado_por_user_id" uuid,
	"verificado_at" timestamp DEFAULT now() NOT NULL,
	"resultado" varchar(32) NOT NULL,
	"detalle" varchar(512),
	"ip_origen" varchar(64)
);
--> statement-breakpoint
ALTER TABLE "nurses" ADD CONSTRAINT "nurses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_patient_id_patients_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_user_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_patient_id_patients_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_doctor_id_doctors_user_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_patients" ADD CONSTRAINT "doctor_patients_doctor_id_doctors_user_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_patients" ADD CONSTRAINT "doctor_patients_patient_id_patients_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_patient_id_patients_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_doctor_id_doctors_user_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bed_assignments" ADD CONSTRAINT "bed_assignments_bed_id_beds_id_fk" FOREIGN KEY ("bed_id") REFERENCES "public"."beds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bed_assignments" ADD CONSTRAINT "bed_assignments_patient_id_patients_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_certificates" ADD CONSTRAINT "doctor_certificates_doctor_id_doctors_user_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_certificates" ADD CONSTRAINT "doctor_certificates_ca_id_certificate_authorities_id_fk" FOREIGN KEY ("ca_id") REFERENCES "public"."certificate_authorities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_medication_id_medications_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_doctors_user_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_certificate_id_doctor_certificates_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."doctor_certificates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_anulada_por_doctor_id_doctors_user_id_fk" FOREIGN KEY ("anulada_por_doctor_id") REFERENCES "public"."doctors"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signature_verifications" ADD CONSTRAINT "signature_verifications_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE no action ON UPDATE no action;