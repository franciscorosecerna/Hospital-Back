import { Hono } from "hono";
import type { TokenPayload } from "../authorization/authorizationService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requirePermission } from "../../middleware/permissionMiddleware";
import { zValidator } from "../../utils/validator";
import * as controller from "./infrastructureController";
import * as schema from "./infrastructureSchema";

const router = new Hono<{ Variables: { user: TokenPayload } }>();
const read = requirePermission("infrastructure:read");
const create = requirePermission("infrastructure:create");
const update = requirePermission("infrastructure:update");
const remove = requirePermission("infrastructure:delete");
router.use("*", authMiddleware);

router.get("/departments", read, controller.listDepartments);
router.post("/departments", create, zValidator("json", schema.createDepartmentSchema), controller.postDepartment);
router.get("/departments/:id", read, zValidator("param", schema.idParamSchema), controller.getDepartment);
router.patch("/departments/:id", update, zValidator("param", schema.idParamSchema), zValidator("json", schema.updateDepartmentSchema), controller.patchDepartment);
router.delete("/departments/:id", remove, zValidator("param", schema.idParamSchema), controller.removeDepartment);

router.get("/floors/department/:departmentId", read, zValidator("param", schema.departmentIdParamSchema), controller.listFloors);
router.post("/floors", create, zValidator("json", schema.createFloorSchema), controller.postFloor);
router.get("/floors/:id", read, zValidator("param", schema.idParamSchema), controller.getFloor);
router.patch("/floors/:id", update, zValidator("param", schema.idParamSchema), zValidator("json", schema.updateFloorSchema), controller.patchFloor);
router.delete("/floors/:id", remove, zValidator("param", schema.idParamSchema), controller.removeFloor);

router.get("/rooms/floor/:floorId", read, zValidator("param", schema.floorIdParamSchema), controller.listRooms);
router.post("/rooms", create, zValidator("json", schema.createRoomSchema), controller.postRoom);
router.get("/rooms/:id", read, zValidator("param", schema.idParamSchema), controller.getRoom);
router.patch("/rooms/:id", update, zValidator("param", schema.idParamSchema), zValidator("json", schema.updateRoomSchema), controller.patchRoom);
router.delete("/rooms/:id", remove, zValidator("param", schema.idParamSchema), controller.removeRoom);

router.get("/beds/room/:roomId", read, zValidator("param", schema.roomIdParamSchema), controller.listBeds);
router.post("/beds", create, zValidator("json", schema.createBedSchema), controller.postBed);
router.get("/beds/:id", read, zValidator("param", schema.idParamSchema), controller.getBed);
router.patch("/beds/:id", update, zValidator("param", schema.idParamSchema), zValidator("json", schema.updateBedSchema), controller.patchBed);
router.delete("/beds/:id", remove, zValidator("param", schema.idParamSchema), controller.removeBed);

router.post("/bed-assignments", create, zValidator("json", schema.createBedAssignmentSchema), controller.postBedAssignment);
router.get("/bed-assignments/patient/:patientId", read, zValidator("param", schema.patientIdParamSchema), controller.listAssignmentsByPatient);
router.get("/bed-assignments/bed/:bedId/active", read, zValidator("param", schema.bedIdParamSchema), controller.getActiveAssignment);
router.get("/bed-assignments/bed/:bedId", read, zValidator("param", schema.bedIdParamSchema), controller.listAssignmentsByBed);
router.get("/bed-assignments/:id", read, zValidator("param", schema.idParamSchema), controller.getBedAssignment);
router.patch("/bed-assignments/:id/end", update, zValidator("param", schema.idParamSchema), zValidator("json", schema.endBedAssignmentSchema), controller.patchEndBedAssignment);

export const infrastructureRouter = router;
export default router;