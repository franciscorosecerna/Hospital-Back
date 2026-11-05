import { type Context } from "hono";
import type { TokenPayload } from "../authorization/authorizationService";
import {
  createBedAssignmentService, createBedService, createDepartmentService, createFloorService,
  createRoomService, deleteBedService, deleteDepartmentService, deleteFloorService,
  deleteRoomService, endBedAssignmentService, fetchActiveBedAssignment,
  fetchBed, fetchBedAssignment, fetchBedAssignmentsByBed, fetchBedAssignmentsByPatient,
  fetchBedsByRoom, fetchDepartment, fetchDepartments, fetchFloor, fetchFloorsByDepartment,
  fetchRoom, fetchRoomsByFloor, updateBedService, updateDepartmentService,
  updateFloorService, updateRoomService,
} from "./infrastructureService";

type AuthedContext = Context<{ Variables: { user: TokenPayload } }>;

export async function listDepartments(c: AuthedContext) {
  const departments = await fetchDepartments();
  return c.json(departments);
}

export async function getDepartment(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const department = await fetchDepartment(id);
  return c.json(department);
}

export async function postDepartment(c: AuthedContext) {
  const input = c.req.valid("json" as never);
  const department = await createDepartmentService(input, c.get("user").sub);
  return c.json(department, 201);
}

export async function patchDepartment(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const department = await updateDepartmentService(id, input, c.get("user").sub);
  return c.json(department);
}

export async function removeDepartment(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const department = await deleteDepartmentService(id, c.get("user").sub);
  return c.json(department);
}

export async function getFloor(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const floor = await fetchFloor(id);
  return c.json(floor);
}

export async function listFloors(c: AuthedContext) {
  const { departmentId } = c.req.valid("param" as never);
  const floors = await fetchFloorsByDepartment(departmentId);
  return c.json(floors);
}

export async function postFloor(c: AuthedContext) {
  const input = c.req.valid("json" as never);
  const floor = await createFloorService(input, c.get("user").sub);
  return c.json(floor, 201);
}

export async function patchFloor(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const floor = await updateFloorService(id, input, c.get("user").sub);
  return c.json(floor);
}

export async function removeFloor(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const floor = await deleteFloorService(id, c.get("user").sub);
  return c.json(floor);
}

export async function getRoom(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const room = await fetchRoom(id);
  return c.json(room);
}

export async function listRooms(c: AuthedContext) {
  const { floorId } = c.req.valid("param" as never);
  const rooms = await fetchRoomsByFloor(floorId);
  return c.json(rooms);
}

export async function postRoom(c: AuthedContext) {
  const input = c.req.valid("json" as never);
  const room = await createRoomService(input, c.get("user").sub);
  return c.json(room, 201);
}

export async function patchRoom(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const room = await updateRoomService(id, input, c.get("user").sub);
  return c.json(room);
}

export async function removeRoom(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const room = await deleteRoomService(id, c.get("user").sub);
  return c.json(room);
}

export async function getBed(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const bed = await fetchBed(id);
  return c.json(bed);
}

export async function listBeds(c: AuthedContext) {
  const { roomId } = c.req.valid("param" as never);
  const beds = await fetchBedsByRoom(roomId);
  return c.json(beds);
}

export async function postBed(c: AuthedContext) {
  const input = c.req.valid("json" as never);
  const bed = await createBedService(input, c.get("user").sub);
  return c.json(bed, 201);
}

export async function patchBed(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const bed = await updateBedService(id, input, c.get("user").sub);
  return c.json(bed);
}

export async function removeBed(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const bed = await deleteBedService(id, c.get("user").sub);
  return c.json(bed);
}

export async function getBedAssignment(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const assignment = await fetchBedAssignment(id);
  return c.json(assignment);
}

export async function listAssignmentsByBed(c: AuthedContext) {
  const { bedId } = c.req.valid("param" as never);
  const assignments = await fetchBedAssignmentsByBed(bedId);
  return c.json(assignments);
}

export async function listAssignmentsByPatient(c: AuthedContext) {
  const { patientId } = c.req.valid("param" as never);
  const assignments = await fetchBedAssignmentsByPatient(patientId);
  return c.json(assignments);
}

export async function getActiveAssignment(c: AuthedContext) {
  const { bedId } = c.req.valid("param" as never);
  const assignment = await fetchActiveBedAssignment(bedId);
  if (!assignment) return c.json({ message: "No hay una asignación activa para esta cama" }, 404);
  return c.json(assignment);
}

export async function postBedAssignment(c: AuthedContext) {
  const input = c.req.valid("json" as never);
  const assignment = await createBedAssignmentService(input, c.get("user").sub);
  return c.json(assignment, 201);
}

export async function patchEndBedAssignment(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const { endDate } = c.req.valid("json" as never);
  const assignment = await endBedAssignmentService(id, endDate, c.get("user").sub);
  return c.json(assignment);
}
