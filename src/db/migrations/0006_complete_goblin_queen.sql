ALTER TABLE "audit_logs" ALTER COLUMN "performed_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "performed_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "revoked_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "allergies" ALTER COLUMN "fecha_registro" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "allergies" ALTER COLUMN "fecha_registro" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "fecha_hora" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "fecha_hora" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "diagnoses" ALTER COLUMN "fecha_registro" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "diagnoses" ALTER COLUMN "fecha_registro" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "procedures" ALTER COLUMN "fecha_hora" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bed_assignments" ALTER COLUMN "start_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bed_assignments" ALTER COLUMN "end_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "certificate_authorities" ALTER COLUMN "valido_desde" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "certificate_authorities" ALTER COLUMN "valido_hasta" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "doctor_certificates" ALTER COLUMN "valido_desde" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "doctor_certificates" ALTER COLUMN "valido_hasta" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "doctor_certificates" ALTER COLUMN "revoked_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "fecha_emision" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "fecha_emision" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "firmada_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "anulada_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "signature_verifications" ALTER COLUMN "verificado_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "signature_verifications" ALTER COLUMN "verificado_at" SET DEFAULT now();