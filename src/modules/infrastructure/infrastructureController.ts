import type { ValidatedContext } from "../../utils/validator";
import type {
  BedIdParam,
  CreateBedAssignmentInput,
  CreateBedInput,
  CreateDepartmentInput,
  CreateFloorInput,
  CreateRoomInput,
  DepartmentIdParam,
  EndBedAssignmentInput,
  FloorIdParam,
  IdParam,
  PatientIdParam,
  RoomIdParam,
  UpdateBedInput,
  UpdateDepartmentInput,
  UpdateFloorInput,
  UpdateRoomInput,
} from "./infrastructureSchema";
import {
  createBedAssignmentService, createBedService, createDepartmentService, createFloorService,
  createRoomService, deleteBedService, deleteDepartmentService, deleteFloorService,
  deleteRoomService, endBedAssignmentService, fetchActiveBedAssignment,
  fetchBed, fetchBedAssignment, fetchBedAssignmentsByBed, fetchBedAssignmentsByPatient,
  fetchBedsByRoom, fetchDepartment, fetchDepartments, fetchFloor, fetchFloorsByDepartment,
  fetchRoom, fetchRoomsByFloor, updateBedService, updateDepartmentService,
  updateFloorService, updateRoomService,
} from "./infrastructureService";

export async function listDepartments(c: ValidatedContext) {
  const departments = await fetchDepartments();
  return c.json(departments);
}

export async function getDepartment(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const department = await fetchDepartment(id);
  return c.json(department);
}

export async function postDepartment(c: ValidatedContext<CreateDepartmentInput>) {
  const input = c.req.valid("json");
  const department = await createDepartmentService(input, c.get("user").sub);
  return c.json(department, 201);
}

export async function patchDepartment(c: ValidatedContext<UpdateDepartmentInput, IdParam>) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const department = await updateDepartmentService(id, input, c.get("user").sub);
  return c.json(department);
}

export async function removeDepartment(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const department = await deleteDepartmentService(id, c.get("user").sub);
  return c.json(department);
}

export async function getFloor(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const floor = await fetchFloor(id);
  return c.json(floor);
}

export async function listFloors(c: ValidatedContext<unknown, DepartmentIdParam>) {
  const { departmentId } = c.req.valid("param");
  const floors = await fetchFloorsByDepartment(departmentId);
  return c.json(floors);
}

export async function postFloor(c: ValidatedContext<CreateFloorInput>) {
  const input = c.req.valid("json");
  const floor = await createFloorService(input, c.get("user").sub);
  return c.json(floor, 201);
}

export async function patchFloor(c: ValidatedContext<UpdateFloorInput, IdParam>) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const floor = await updateFloorService(id, input, c.get("user").sub);
  return c.json(floor);
}

export async function removeFloor(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const floor = await deleteFloorService(id, c.get("user").sub);
  return c.json(floor);
}

export async function getRoom(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const room = await fetchRoom(id);
  return c.json(room);
}

export async function listRooms(c: ValidatedContext<unknown, FloorIdParam>) {
  const { floorId } = c.req.valid("param");
  const rooms = await fetchRoomsByFloor(floorId);
  return c.json(rooms);
}

export async function postRoom(c: ValidatedContext<CreateRoomInput>) {
  const input = c.req.valid("json");
  const room = await createRoomService(input, c.get("user").sub);
  return c.json(room, 201);
}

export async function patchRoom(c: ValidatedContext<UpdateRoomInput, IdParam>) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const room = await updateRoomService(id, input, c.get("user").sub);
  return c.json(room);
}

export async function removeRoom(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const room = await deleteRoomService(id, c.get("user").sub);
  return c.json(room);
}

export async function getBed(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const bed = await fetchBed(id);
  return c.json(bed);
}

export async function listBeds(c: ValidatedContext<unknown, RoomIdParam>) {
  const { roomId } = c.req.valid("param");
  const beds = await fetchBedsByRoom(roomId);
  return c.json(beds);
}

export async function postBed(c: ValidatedContext<CreateBedInput>) {
  const input = c.req.valid("json");
  const bed = await createBedService(input, c.get("user").sub);
  return c.json(bed, 201);
}

export async function patchBed(c: ValidatedContext<UpdateBedInput, IdParam>) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const bed = await updateBedService(id, input, c.get("user").sub);
  return c.json(bed);
}

export async function removeBed(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const bed = await deleteBedService(id, c.get("user").sub);
  return c.json(bed);
}

export async function getBedAssignment(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const assignment = await fetchBedAssignment(id);
  return c.json(assignment);
}

export async function listAssignmentsByBed(c: ValidatedContext<unknown, BedIdParam>) {
  const { bedId } = c.req.valid("param");
  const assignments = await fetchBedAssignmentsByBed(bedId);
  return c.json(assignments);
}

export async function listAssignmentsByPatient(c: ValidatedContext<unknown, PatientIdParam>) {
  const { patientId } = c.req.valid("param");
  const assignments = await fetchBedAssignmentsByPatient(patientId);
  return c.json(assignments);
}

export async function getActiveAssignment(c: ValidatedContext<unknown, BedIdParam>) {
  const { bedId } = c.req.valid("param");
  const assignment = await fetchActiveBedAssignment(bedId);
  if (!assignment) return c.json({ message: "No hay una asignación activa para esta cama" }, 404);
  return c.json(assignment);
}

export async function postBedAssignment(c: ValidatedContext<CreateBedAssignmentInput>) {
  const input = c.req.valid("json");
  const assignment = await createBedAssignmentService(input, c.get("user").sub);
  return c.json(assignment, 201);
}

export async function patchEndBedAssignment(c: ValidatedContext<EndBedAssignmentInput, IdParam>) {
  const { id } = c.req.valid("param");
  const { endDate } = c.req.valid("json");
  const assignment = await endBedAssignmentService(id, endDate, c.get("user").sub);
  return c.json(assignment);
}