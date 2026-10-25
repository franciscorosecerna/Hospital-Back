import { eq, and, isNull, desc } from "drizzle-orm";
import { db } from "../../db/client";
import { doctorPatients } from "../../db/schema/clinical";
import { parsePgError, RecordNotFoundException } from "../../utils/exceptions";
import { insertAuditLogTx } from "../auditLogs/auditLogRepository";

export type NewDoctorPatient = typeof doctorPatients.$inferInsert;
export type DoctorPatient = typeof doctorPatients.$inferSelect;

export const notFinalized = isNull(doctorPatients.fechaFinalizacion);

export async function getDoctorPatientById(id: string): Promise<DoctorPatient> {
  try {
    const [assignment] = await db
      .select()
      .from(doctorPatients)
      .where(eq(doctorPatients.id, id));
    if (!assignment) throw new RecordNotFoundException("doctor_patients", id);
    return assignment;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getActiveAssignmentsByPatient(
  patientId: string
): Promise<DoctorPatient[]> {
  try {
    return await db
      .select()
      .from(doctorPatients)
      .where(and(eq(doctorPatients.patientId, patientId), notFinalized))
      .orderBy(desc(doctorPatients.fechaAsignacion));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getActiveAssignmentsByDoctor(
  doctorId: string,
  limit: number = 50,
  offset: number = 0
): Promise<DoctorPatient[]> {
  try {
    return await db
      .select()
      .from(doctorPatients)
      .where(and(eq(doctorPatients.doctorId, doctorId), notFinalized))
      .orderBy(desc(doctorPatients.fechaAsignacion))
      .limit(limit)
      .offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function assignDoctorToPatient(
  data: NewDoctorPatient,
  performedBy?: string
): Promise<DoctorPatient> {
  try {
    return await db.transaction(async (tx) => {
      const [assignment] = await tx.insert(doctorPatients).values(data).returning();
      if (!assignment) throw new Error("Failed to create doctor_patients assignment");

      await insertAuditLogTx(
        tx,
        "created",
        "doctor_patients",
        assignment.id,
        undefined,
        assignment,
        performedBy
      );

      return assignment;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function finalizeAssignment(
  id: string,
  fechaFinalizacion: string,
  performedBy?: string
): Promise<DoctorPatient> {
  try {
    return await db.transaction(async (tx) => {
      const [previous] = await tx
        .select()
        .from(doctorPatients)
        .where(and(eq(doctorPatients.id, id), notFinalized));
      if (!previous) throw new RecordNotFoundException("doctor_patients", id);

      const [updated] = await tx
        .update(doctorPatients)
        .set({ fechaFinalizacion })
        .where(eq(doctorPatients.id, id))
        .returning();
      if (!updated) throw new RecordNotFoundException("doctor_patients", id);

      await insertAuditLogTx(
        tx,
        "updated",
        "doctor_patients",
        id,
        previous,
        updated,
        performedBy
      );

      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}