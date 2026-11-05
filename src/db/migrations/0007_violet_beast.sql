ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_appointment_id_unique";--> statement-breakpoint
ALTER TABLE "prescriptions" DROP CONSTRAINT "chk_firma";--> statement-breakpoint
ALTER TABLE "prescription_items" DROP CONSTRAINT "prescription_items_prescription_id_prescriptions_id_fk";
--> statement-breakpoint
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_active_prescription_appointment" ON "prescriptions" USING btree ("appointment_id") WHERE "prescriptions"."estado" != 'Anulada';--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "chk_estado" CHECK ("prescriptions"."estado" IN ('Borrador', 'Firmada', 'Anulada'));--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "chk_firma" CHECK (("prescriptions"."estado" != 'Firmada') OR (
        "prescriptions"."certificate_id"      IS NOT NULL AND
        "prescriptions"."firmada_at"          IS NOT NULL AND
        "prescriptions"."document_hash"       IS NOT NULL AND
        "prescriptions"."signature"          IS NOT NULL AND
        "prescriptions"."signature_algorithm" IS NOT NULL
      ));