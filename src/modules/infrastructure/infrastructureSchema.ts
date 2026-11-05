import { z } from "zod";

const uuid = z.uuid("Debe ser un UUID válido");
const nonEmptyUpdate = () =>
  (data: Record<string, unknown>) => Object.values(data).some((value) => value !== undefined);

export const createDepartmentSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
});
export const updateDepartmentSchema = createDepartmentSchema.partial().refine(nonEmptyUpdate());

export const createFloorSchema = z.object({
  numero: z.number().int(),
  departmentId: uuid,
});
export const updateFloorSchema = createFloorSchema.partial().refine(nonEmptyUpdate());

export const createRoomSchema = z.object({
  numero: z.number().int(),
  floorId: uuid,
});
export const updateRoomSchema = createRoomSchema.partial().refine(nonEmptyUpdate());

export const createBedSchema = z.object({
  numero: z.number().int(),
  roomId: uuid,
});
export const updateBedSchema = createBedSchema.partial().refine(nonEmptyUpdate());

const timestamp = z.iso.datetime({ offset: true }).transform((value) => new Date(value));
export const createBedAssignmentSchema = z.object({
  bedId: uuid,
  patientId: uuid,
  startDate: timestamp,
  endDate: timestamp.optional(),
});
export const endBedAssignmentSchema = z.object({ endDate: timestamp });

export const idParamSchema = z.object({ id: uuid });
export const departmentIdParamSchema = z.object({ departmentId: uuid });
export const floorIdParamSchema = z.object({ floorId: uuid });
export const roomIdParamSchema = z.object({ roomId: uuid });
export const bedIdParamSchema = z.object({ bedId: uuid });
export const patientIdParamSchema = z.object({ patientId: uuid });

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type CreateFloorInput = z.infer<typeof createFloorSchema>;
export type UpdateFloorInput = z.infer<typeof updateFloorSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type CreateBedInput = z.infer<typeof createBedSchema>;
export type UpdateBedInput = z.infer<typeof updateBedSchema>;
export type CreateBedAssignmentInput = z.infer<typeof createBedAssignmentSchema>;
