import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "../../db/client";
import { appointments } from "../../db/schema/clinical";
import {
  certificateAuthorities,
  doctorCertificates,
  prescriptionItems,
  prescriptions,
  signatureVerifications,
} from "../../db/schema/prescriptions";
import {
  ForbiddenException,
  InvalidInputException,
  parsePgError,
  RecordNotFoundException,
} from "../../utils/exceptions";
import { insertAuditLogTx, type Tx } from "../auditLogs/auditLogRepository";

export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;
export type PrescriptionItem = typeof prescriptionItems.$inferSelect;
export type NewPrescriptionItem = typeof prescriptionItems.$inferInsert;
export type PrescriptionWithItems = Prescription & { items: PrescriptionItem[] };
export type SignatureVerification = typeof signatureVerifications.$inferSelect;
export type NewSignatureVerification = typeof signatureVerifications.$inferInsert;
export type DoctorCertificate = typeof doctorCertificates.$inferSelect;
export type CertificateAuthority = typeof certificateAuthorities.$inferSelect;

type DbExecutor = typeof db | Tx;

async function attachItems(executor: DbExecutor, prescription: Prescription): Promise<PrescriptionWithItems> {
  const items = await executor.select().from(prescriptionItems)
    .where(eq(prescriptionItems.prescriptionId, prescription.id));
  return { ...prescription, items };
}

async function attachItemsToMany(executor: DbExecutor, rows: Prescription[]): Promise<PrescriptionWithItems[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const allItems = await executor.select().from(prescriptionItems)
    .where(inArray(prescriptionItems.prescriptionId, ids));

  const itemsByPrescriptionId = new Map<string, PrescriptionItem[]>();
  for (const item of allItems) {
    const list = itemsByPrescriptionId.get(item.prescriptionId) ?? [];
    list.push(item);
    itemsByPrescriptionId.set(item.prescriptionId, list);
  }

  return rows.map((row) => ({
    ...row,
    items: itemsByPrescriptionId.get(row.id) ?? [],
  }));
}

async function getWithItems(executor: DbExecutor, id: string): Promise<PrescriptionWithItems> {
  const [prescription] = await executor.select().from(prescriptions).where(eq(prescriptions.id, id));
  if (!prescription) throw new RecordNotFoundException("prescriptions", id);
  return attachItems(executor, prescription);
}

async function getLockedPrescriptionForDoctor(
  tx: Tx,
  id: string,
  doctorId: string,
  expectedState: "Borrador" | "Firmada",
): Promise<Prescription> {
  const [existing] = await tx
    .select()
    .from(prescriptions)
    .where(eq(prescriptions.id, id))
    .for("update");

  if (!existing) throw new RecordNotFoundException("prescriptions", id);
  if (existing.doctorId !== doctorId) {
    throw new ForbiddenException("No tiene permiso para modificar una receta emitida por otro médico.");
  }
  if (existing.estado !== expectedState) {
    throw new InvalidInputException(
      `La operación requiere que la receta esté en estado "${expectedState}", pero su estado actual es "${existing.estado}".`,
    );
  }
  return existing;
}

export async function getPrescriptionById(id: string): Promise<PrescriptionWithItems> {
  try {
    return await getWithItems(db, id);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getPrescriptionByAppointment(appointmentId: string): Promise<PrescriptionWithItems> {
  try {
    const [prescription] = await db.select().from(prescriptions)
      .where(and(
        eq(prescriptions.appointmentId, appointmentId),
        ne(prescriptions.estado, "Anulada"),
      ))
      .orderBy(desc(prescriptions.fechaEmision));
    if (!prescription) throw new RecordNotFoundException("prescriptions", appointmentId);
    return await attachItems(db, prescription);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getPrescriptionsByPatient(
  patientId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<PrescriptionWithItems[]> {
  try {
    const rows = await db.select().from(prescriptions)
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.fechaEmision))
      .limit(limit)
      .offset(offset);
    return await attachItemsToMany(db, rows);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getPrescriptionsByDoctor(
  doctorId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<PrescriptionWithItems[]> {
  try {
    const rows = await db.select().from(prescriptions)
      .where(eq(prescriptions.doctorId, doctorId))
      .orderBy(desc(prescriptions.fechaEmision))
      .limit(limit)
      .offset(offset);
    return await attachItemsToMany(db, rows);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAppointmentForPrescription(appointmentId: string) {
  try {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId));
    if (!appointment) throw new RecordNotFoundException("appointments", appointmentId);
    return appointment;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getCertificateWithCaById(
  certificateId: string,
): Promise<{ certificate: DoctorCertificate; ca: CertificateAuthority } | undefined> {
  try {
    const [record] = await db
      .select({
        certificate: doctorCertificates,
        ca: certificateAuthorities,
      })
      .from(doctorCertificates)
      .innerJoin(certificateAuthorities, eq(doctorCertificates.caId, certificateAuthorities.id))
      .where(eq(doctorCertificates.id, certificateId));
    return record;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createPrescription(
  data: Omit<NewPrescription, "estado" | "certificateId" | "firmadaAt" | "documentHash" | "signature" | "signatureAlgorithm" | "anuladaAt" | "motivoAnulacion" | "anuladaPorDoctorId">,
  items: Omit<NewPrescriptionItem, "id" | "prescriptionId">[],
  performedBy: string,
): Promise<PrescriptionWithItems> {
  try {
    return await db.transaction(async (tx) => {
      const [created] = await tx.insert(prescriptions).values(data).returning();
      if (!created) throw new Error("Failed to create prescription");
      const insertedItems = await tx.insert(prescriptionItems)
        .values(items.map((item) => ({ ...item, prescriptionId: created.id })))
        .returning();
      const result: PrescriptionWithItems = { ...created, items: insertedItems };
      await insertAuditLogTx(tx, "created", "prescriptions", created.id, undefined, result, performedBy);
      return result;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateDraftPrescription(
  id: string,
  doctorId: string,
  data: { observaciones?: string | null },
  items: Omit<NewPrescriptionItem, "id" | "prescriptionId">[] | undefined,
  performedBy: string,
): Promise<PrescriptionWithItems> {
  try {
    return await db.transaction(async (tx) => {
      const existing = await getLockedPrescriptionForDoctor(tx, id, doctorId, "Borrador");
      const previous = await attachItems(tx, existing);

      if (data.observaciones !== undefined) {
        await tx.update(prescriptions)
          .set({ observaciones: data.observaciones })
          .where(and(eq(prescriptions.id, id), eq(prescriptions.estado, "Borrador")));
      }

      if (items) {
        await tx.delete(prescriptionItems).where(eq(prescriptionItems.prescriptionId, id));
        await tx.insert(prescriptionItems).values(items.map((item) => ({ ...item, prescriptionId: id })));
      }

      const updated = await getWithItems(tx, id);
      await insertAuditLogTx(tx, "updated", "prescriptions", id, previous, updated, performedBy);
      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteDraftPrescription(
  id: string,
  doctorId: string,
  performedBy: string,
): Promise<PrescriptionWithItems> {
  try {
    return await db.transaction(async (tx) => {
      const existing = await getLockedPrescriptionForDoctor(tx, id, doctorId, "Borrador");
      const previous = await attachItems(tx, existing);

      await tx.delete(prescriptionItems).where(eq(prescriptionItems.prescriptionId, id));
      await tx.delete(prescriptions).where(and(eq(prescriptions.id, id), eq(prescriptions.estado, "Borrador")));

      await insertAuditLogTx(tx, "deleted", "prescriptions", id, previous, undefined, performedBy);
      return previous;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function signPrescription(
  id: string,
  doctorId: string,
  signatureData: Required<Pick<NewPrescription, "certificateId" | "documentHash" | "signature" | "signatureAlgorithm" | "firmadaAt">>,
  performedBy: string,
): Promise<PrescriptionWithItems> {
  try {
    return await db.transaction(async (tx) => {
      const existing = await getLockedPrescriptionForDoctor(tx, id, doctorId, "Borrador");
      const previous = await attachItems(tx, existing);

      await tx.update(prescriptions).set({
        ...signatureData,
        estado: "Firmada",
      }).where(and(eq(prescriptions.id, id), eq(prescriptions.estado, "Borrador")));

      const updated = await getWithItems(tx, id);
      await insertAuditLogTx(tx, "updated", "prescriptions", id, previous, updated, performedBy);
      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createSignatureVerification(
  data: NewSignatureVerification,
): Promise<SignatureVerification> {
  try {
    const [verification] = await db
      .insert(signatureVerifications)
      .values(data)
      .returning();
    if (!verification) throw new Error("Failed to record signature verification");
    return verification;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function annulPrescription(
  id: string,
  doctorId: string,
  motivoAnulacion: string,
  performedBy: string,
): Promise<PrescriptionWithItems> {
  try {
    return await db.transaction(async (tx) => {
      const existing = await getLockedPrescriptionForDoctor(tx, id, doctorId, "Firmada");
      const previous = await attachItems(tx, existing);

      await tx.update(prescriptions).set({
        estado: "Anulada",
        anuladaAt: new Date(),
        motivoAnulacion,
        anuladaPorDoctorId: doctorId,
      }).where(and(eq(prescriptions.id, id), eq(prescriptions.estado, "Firmada")));

      const updated = await getWithItems(tx, id);
      await insertAuditLogTx(tx, "updated", "prescriptions", id, previous, updated, performedBy);
      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}
