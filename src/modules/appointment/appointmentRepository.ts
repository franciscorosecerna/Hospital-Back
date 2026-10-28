import { and, eq, ne } from "drizzle-orm";
import { db } from "../../db/client";
import { appointments } from "../../db/schema/clinical";
import { parsePgError, RecordNotFoundException } from "../../utils/exceptions";
import { insertAuditLogTx } from "../auditLogs/auditLogRepository";

export type NewAppointment = typeof appointments.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;

export const notCancelled = ne(appointments.estado, "Cancelada");

export async function getAppointmentById(id: string): Promise<Appointment> {
  try {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));
    if (!appointment) throw new RecordNotFoundException("appointments", id);
    return appointment;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAppointmentsByPatient(
  patientId: string
): Promise<Appointment[]> {
  try {
    return await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.patientId, patientId), notCancelled))
      .orderBy(appointments.fechaHora);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAppointmentsByDoctor(
  doctorId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Appointment[]> {
  try {
    return await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.doctorId, doctorId), notCancelled))
      .orderBy(appointments.fechaHora)
      .limit(limit)
      .offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createAppointment(
  data: NewAppointment,
  performedBy?: string
): Promise<Appointment> {
  try {
    return await db.transaction(async (tx) => {
      const [appointment] = await tx.insert(appointments).values(data).returning();
      if (!appointment) throw new Error("Failed to create appointment");

      await insertAuditLogTx(
        tx,
        "created",
        "appointments",
        appointment.id,
        undefined,
        appointment,
        performedBy
      );

      return appointment;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateAppointment(
  id: string,
  data: Partial<Omit<NewAppointment, "id">>,
  performedBy?: string
): Promise<Appointment> {
  try {
    return await db.transaction(async (tx) => {
      const [previous] = await tx
        .select()
        .from(appointments)
        .where(eq(appointments.id, id));
      if (!previous) throw new RecordNotFoundException("appointments", id);

      const [updated] = await tx
        .update(appointments)
        .set(data)
        .where(eq(appointments.id, id))
        .returning();
      if (!updated) throw new RecordNotFoundException("appointments", id);

      await insertAuditLogTx(tx, "updated", "appointments", id, previous, updated, performedBy);

      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

async function setEstado(
  id: string,
  estado: "Confirmada" | "Cancelada" | "Completada",
  performedBy?: string
): Promise<Appointment> {
  try {
    return await db.transaction(async (tx) => {
      const [previous] = await tx
        .select()
        .from(appointments)
        .where(eq(appointments.id, id));
      if (!previous) throw new RecordNotFoundException("appointments", id);

      const [updated] = await tx
        .update(appointments)
        .set({ estado })
        .where(eq(appointments.id, id))
        .returning();
      if (!updated) throw new RecordNotFoundException("appointments", id);

      await insertAuditLogTx(tx, "updated", "appointments", id, previous, updated, performedBy);

      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function confirmAppointment(
  id: string,
  performedBy?: string
): Promise<Appointment> {
  return setEstado(id, "Confirmada", performedBy);
}

export async function cancelAppointment(
  id: string,
  performedBy?: string
): Promise<Appointment> {
  return setEstado(id, "Cancelada", performedBy);
}

export async function completeAppointment(
  id: string,
  performedBy?: string
): Promise<Appointment> {
  return setEstado(id, "Completada", performedBy);
}