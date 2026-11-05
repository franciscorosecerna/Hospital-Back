import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../db/client";
import {
  bedAssignments,
  beds,
  departments,
  floors,
  rooms,
} from "../../db/schema/infrastructure";
import { parsePgError, RecordNotFoundException } from "../../utils/exceptions";
import { insertAuditLogTx } from "../auditLogs/auditLogRepository";

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type Floor = typeof floors.$inferSelect;
export type NewFloor = typeof floors.$inferInsert;
export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
export type Bed = typeof beds.$inferSelect;
export type NewBed = typeof beds.$inferInsert;
export type BedAssignment = typeof bedAssignments.$inferSelect;
export type NewBedAssignment = typeof bedAssignments.$inferInsert;

export const activeBedAssignment = isNull(bedAssignments.endDate);

export async function getDepartmentById(id: string): Promise<Department> {
  try {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    if (!department) throw new RecordNotFoundException("departments", id);
    return department;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getDepartments(): Promise<Department[]> {
  try {
    return await db.select().from(departments).orderBy(departments.nombre);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createDepartment(data: NewDepartment, performedBy?: string): Promise<Department> {
  try {
    return await db.transaction(async (tx) => {
      const [created] = await tx.insert(departments).values(data).returning();
      if (!created) throw new Error("Failed to create department");
      await insertAuditLogTx(tx, "created", "departments", created.id, undefined, created, performedBy);
      return created;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateDepartment(id: string, data: Partial<Omit<NewDepartment, "id">>, performedBy?: string): Promise<Department> {
  try {
    return await db.transaction(async (tx) => {
      const [previous] = await tx.select().from(departments).where(eq(departments.id, id));
      if (!previous) throw new RecordNotFoundException("departments", id);
      const [updated] = await tx.update(departments).set(data).where(eq(departments.id, id)).returning();
      if (!updated) throw new RecordNotFoundException("departments", id);
      await insertAuditLogTx(tx, "updated", "departments", id, previous, updated, performedBy);
      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteDepartment(id: string, performedBy?: string): Promise<Department> {
  try {
    return await db.transaction(async (tx) => {
      const [deleted] = await tx.delete(departments).where(eq(departments.id, id)).returning();
      if (!deleted) throw new RecordNotFoundException("departments", id);
      await insertAuditLogTx(tx, "deleted", "departments", id, deleted, undefined, performedBy);
      return deleted;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getFloorById(id: string): Promise<Floor> {
  try {
    const [floor] = await db.select().from(floors).where(eq(floors.id, id));
    if (!floor) throw new RecordNotFoundException("floors", id);
    return floor;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getFloorsByDepartment(departmentId: string): Promise<Floor[]> {
  try {
    return await db.select().from(floors).where(eq(floors.departmentId, departmentId)).orderBy(floors.numero);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createFloor(data: NewFloor, performedBy?: string): Promise<Floor> {
  try {
    return await db.transaction(async (tx) => {
      const [created] = await tx.insert(floors).values(data).returning();
      if (!created) throw new Error("Failed to create floor");
      await insertAuditLogTx(tx, "created", "floors", created.id, undefined, created, performedBy);
      return created;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateFloor(id: string, data: Partial<Omit<NewFloor, "id">>, performedBy?: string): Promise<Floor> {
  try {
    return await db.transaction(async (tx) => {
      const [previous] = await tx.select().from(floors).where(eq(floors.id, id));
      if (!previous) throw new RecordNotFoundException("floors", id);
      const [updated] = await tx.update(floors).set(data).where(eq(floors.id, id)).returning();
      if (!updated) throw new RecordNotFoundException("floors", id);
      await insertAuditLogTx(tx, "updated", "floors", id, previous, updated, performedBy);
      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteFloor(id: string, performedBy?: string): Promise<Floor> {
  try {
    return await db.transaction(async (tx) => {
      const [deleted] = await tx.delete(floors).where(eq(floors.id, id)).returning();
      if (!deleted) throw new RecordNotFoundException("floors", id);
      await insertAuditLogTx(tx, "deleted", "floors", id, deleted, undefined, performedBy);
      return deleted;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getRoomById(id: string): Promise<Room> {
  try {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    if (!room) throw new RecordNotFoundException("rooms", id);
    return room;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getRoomsByFloor(floorId: string): Promise<Room[]> {
  try {
    return await db.select().from(rooms).where(eq(rooms.floorId, floorId)).orderBy(rooms.numero);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createRoom(data: NewRoom, performedBy?: string): Promise<Room> {
  try {
    return await db.transaction(async (tx) => {
      const [created] = await tx.insert(rooms).values(data).returning();
      if (!created) throw new Error("Failed to create room");
      await insertAuditLogTx(tx, "created", "rooms", created.id, undefined, created, performedBy);
      return created;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateRoom(id: string, data: Partial<Omit<NewRoom, "id">>, performedBy?: string): Promise<Room> {
  try {
    return await db.transaction(async (tx) => {
      const [previous] = await tx.select().from(rooms).where(eq(rooms.id, id));
      if (!previous) throw new RecordNotFoundException("rooms", id);
      const [updated] = await tx.update(rooms).set(data).where(eq(rooms.id, id)).returning();
      if (!updated) throw new RecordNotFoundException("rooms", id);
      await insertAuditLogTx(tx, "updated", "rooms", id, previous, updated, performedBy);
      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteRoom(id: string, performedBy?: string): Promise<Room> {
  try {
    return await db.transaction(async (tx) => {
      const [deleted] = await tx.delete(rooms).where(eq(rooms.id, id)).returning();
      if (!deleted) throw new RecordNotFoundException("rooms", id);
      await insertAuditLogTx(tx, "deleted", "rooms", id, deleted, undefined, performedBy);
      return deleted;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getBedById(id: string): Promise<Bed> {
  try {
    const [bed] = await db.select().from(beds).where(eq(beds.id, id));
    if (!bed) throw new RecordNotFoundException("beds", id);
    return bed;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getBedsByRoom(roomId: string): Promise<Bed[]> {
  try {
    return await db.select().from(beds).where(eq(beds.roomId, roomId)).orderBy(beds.numero);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createBed(data: NewBed, performedBy?: string): Promise<Bed> {
  try {
    return await db.transaction(async (tx) => {
      const [created] = await tx.insert(beds).values(data).returning();
      if (!created) throw new Error("Failed to create bed");
      await insertAuditLogTx(tx, "created", "beds", created.id, undefined, created, performedBy);
      return created;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateBed(id: string, data: Partial<Omit<NewBed, "id">>, performedBy?: string): Promise<Bed> {
  try {
    return await db.transaction(async (tx) => {
      const [previous] = await tx.select().from(beds).where(eq(beds.id, id));
      if (!previous) throw new RecordNotFoundException("beds", id);
      const [updated] = await tx.update(beds).set(data).where(eq(beds.id, id)).returning();
      if (!updated) throw new RecordNotFoundException("beds", id);
      await insertAuditLogTx(tx, "updated", "beds", id, previous, updated, performedBy);
      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteBed(id: string, performedBy?: string): Promise<Bed> {
  try {
    return await db.transaction(async (tx) => {
      const [deleted] = await tx.delete(beds).where(eq(beds.id, id)).returning();
      if (!deleted) throw new RecordNotFoundException("beds", id);
      await insertAuditLogTx(tx, "deleted", "beds", id, deleted, undefined, performedBy);
      return deleted;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getBedAssignmentById(id: string): Promise<BedAssignment> {
  try {
    const [assignment] = await db.select().from(bedAssignments).where(eq(bedAssignments.id, id));
    if (!assignment) throw new RecordNotFoundException("bed_assignments", id);
    return assignment;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getBedAssignmentsByPatient(patientId: string): Promise<BedAssignment[]> {
  try {
    return await db.select().from(bedAssignments)
      .where(eq(bedAssignments.patientId, patientId))
      .orderBy(desc(bedAssignments.startDate));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getBedAssignmentsByBed(bedId: string): Promise<BedAssignment[]> {
  try {
    return await db.select().from(bedAssignments)
      .where(eq(bedAssignments.bedId, bedId))
      .orderBy(desc(bedAssignments.startDate));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getActiveBedAssignment(bedId: string): Promise<BedAssignment | undefined> {
  try {
    const [assignment] = await db.select().from(bedAssignments)
      .where(and(eq(bedAssignments.bedId, bedId), activeBedAssignment));
    return assignment;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createBedAssignment(data: NewBedAssignment, performedBy?: string): Promise<BedAssignment> {
  try {
    return await db.transaction(async (tx) => {
      const [created] = await tx.insert(bedAssignments).values(data).returning();
      if (!created) throw new Error("Failed to create bed assignment");
      await insertAuditLogTx(tx, "created", "bed_assignments", created.id, undefined, created, performedBy);
      return created;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function endBedAssignment(id: string, endDate: Date, performedBy?: string): Promise<BedAssignment> {
  try {
    return await db.transaction(async (tx) => {
      const [previous] = await tx.select().from(bedAssignments)
        .where(and(eq(bedAssignments.id, id), activeBedAssignment));
      if (!previous) throw new RecordNotFoundException("bed_assignments", id);
      const [updated] = await tx.update(bedAssignments).set({ endDate })
        .where(eq(bedAssignments.id, id)).returning();
      if (!updated) throw new RecordNotFoundException("bed_assignments", id);
      await insertAuditLogTx(tx, "updated", "bed_assignments", id, previous, updated, performedBy);
      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}
