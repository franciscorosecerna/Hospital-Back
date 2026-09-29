import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { TokenPayload } from "../authorization/authorizationService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requirePermission } from "../../middleware/permissionMiddleware";
import {
  createProcedureSchema,
  updateProcedureSchema,
  idParamSchema,
  appointmentIdParamSchema,
  patientIdParamSchema,
  doctorIdParamSchema,
  paginationQuerySchema,
} from "./procedureSchema";
import {
  createProcedure,
  getProcedureById,
  getProceduresByAppointment,
  getProceduresByPatient,
  getProceduresByDoctor,
  updateProcedure,
  deleteProcedure,
} from "./procedureController";

export const procedureRouter = new Hono<{
  Variables: { user: TokenPayload };
}>();

procedureRouter.post(
  "/",
  authMiddleware,
  requirePermission("procedure:create"),
  zValidator("json", createProcedureSchema),
  createProcedure,
);

procedureRouter.get(
  "/:id",
  authMiddleware,
  requirePermission("procedure:read"),
  zValidator("param", idParamSchema),
  getProcedureById,
);

procedureRouter.get(
  "/appointment/:appointmentId",
  authMiddleware,
  requirePermission("procedure:read"),
  zValidator("param", appointmentIdParamSchema),
  getProceduresByAppointment,
);

procedureRouter.get(
  "/patient/:patientId",
  authMiddleware,
  requirePermission("procedure:read"),
  zValidator("param", patientIdParamSchema),
  zValidator("query", paginationQuerySchema),
  getProceduresByPatient,
);

procedureRouter.get(
  "/doctor/:doctorId",
  authMiddleware,
  requirePermission("procedure:read"),
  zValidator("param", doctorIdParamSchema),
  zValidator("query", paginationQuerySchema),
  getProceduresByDoctor,
);

procedureRouter.patch(
  "/:id",
  authMiddleware,
  requirePermission("procedure:update"),
  zValidator("param", idParamSchema),
  zValidator("json", updateProcedureSchema),
  updateProcedure,
);

procedureRouter.delete(
  "/:id",
  authMiddleware,
  requirePermission("procedure:delete"),
  zValidator("param", idParamSchema),
  deleteProcedure,
);

export default procedureRouter;