import {
  createBed, createBedAssignment, createDepartment, createFloor, createRoom,
  deleteBed, deleteDepartment, deleteFloor, deleteRoom, endBedAssignment,
  getActiveBedAssignment, getBedAssignmentById, getBedAssignmentsByBed,
  getBedAssignmentsByPatient, getBedById, getBedsByRoom, getDepartmentById,
  getDepartments, getFloorById, getFloorsByDepartment, getRoomById, getRoomsByFloor,
  updateBed, updateDepartment, updateFloor, updateRoom,
  type NewBed, type NewBedAssignment, type NewDepartment, type NewFloor, type NewRoom,
} from "./infrastructureRepository";

export const fetchDepartments = () => getDepartments();
export const fetchDepartment = (id: string) => getDepartmentById(id);
export const createDepartmentService = (data: NewDepartment, by?: string) => createDepartment(data, by);
export const updateDepartmentService = (id: string, data: Partial<NewDepartment>, by?: string) => updateDepartment(id, data, by);
export const deleteDepartmentService = (id: string, by?: string) => deleteDepartment(id, by);

export const fetchFloor = (id: string) => getFloorById(id);
export const fetchFloorsByDepartment = (id: string) => getFloorsByDepartment(id);
export const createFloorService = (data: NewFloor, by?: string) => createFloor(data, by);
export const updateFloorService = (id: string, data: Partial<NewFloor>, by?: string) => updateFloor(id, data, by);
export const deleteFloorService = (id: string, by?: string) => deleteFloor(id, by);

export const fetchRoom = (id: string) => getRoomById(id);
export const fetchRoomsByFloor = (id: string) => getRoomsByFloor(id);
export const createRoomService = (data: NewRoom, by?: string) => createRoom(data, by);
export const updateRoomService = (id: string, data: Partial<NewRoom>, by?: string) => updateRoom(id, data, by);
export const deleteRoomService = (id: string, by?: string) => deleteRoom(id, by);

export const fetchBed = (id: string) => getBedById(id);
export const fetchBedsByRoom = (id: string) => getBedsByRoom(id);
export const createBedService = (data: NewBed, by?: string) => createBed(data, by);
export const updateBedService = (id: string, data: Partial<NewBed>, by?: string) => updateBed(id, data, by);
export const deleteBedService = (id: string, by?: string) => deleteBed(id, by);

export const fetchBedAssignment = (id: string) => getBedAssignmentById(id);
export const fetchBedAssignmentsByBed = (id: string) => getBedAssignmentsByBed(id);
export const fetchBedAssignmentsByPatient = (id: string) => getBedAssignmentsByPatient(id);
export const fetchActiveBedAssignment = (id: string) => getActiveBedAssignment(id);
export const createBedAssignmentService = (data: NewBedAssignment, by?: string) => createBedAssignment(data, by);
export const endBedAssignmentService = (id: string, endDate: Date, by?: string) => endBedAssignment(id, endDate, by);
