import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { TokenPayload } from "../authorization/authorizationService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requirePermission } from "../../middleware/permissionMiddleware";
import {
  createDiagnosisSchema,
  updateDiagnosisSchema,
  idParamSchema,
  appointmentIdParamSchema,
  patientIdParamSchema,
  paginationQuerySchema,
} from "./diagnosisSchema";
import {
  createDiagnosis,
  getDiagnosisById,
  getDiagnosesByAppointment,
  getDiagnosesByPatient,
  updateDiagnosis,
  deleteDiagnosis,
} from "./diagnosisController";

export const diagnosisRouter = new Hono<{
  Variables: { user: TokenPayload };
}>();


diagnosisRouter.post(
  "/",
  authMiddleware,
  requirePermission("diagnosis:create"),
  zValidator("json", createDiagnosisSchema),
  createDiagnosis,
);

diagnosisRouter.get(
  "/:id",
  authMiddleware,
  requirePermission("diagnosis:read"),
  zValidator("param", idParamSchema),
  getDiagnosisById,
);

diagnosisRouter.get(
  "/appointment/:appointmentId",
  authMiddleware,
  requirePermission("diagnosis:read"),
  zValidator("param", appointmentIdParamSchema),
  getDiagnosesByAppointment,
);

diagnosisRouter.get(
  "/patient/:patientId",
  authMiddleware,
  requirePermission("diagnosis:read"),
  zValidator("param", patientIdParamSchema),
  zValidator("query", paginationQuerySchema),
  getDiagnosesByPatient,
);

diagnosisRouter.patch(
  "/:id",
  authMiddleware,
  requirePermission("diagnosis:update"),
  zValidator("param", idParamSchema),
  zValidator("json", updateDiagnosisSchema),
  updateDiagnosis,
);

diagnosisRouter.delete(
  "/:id",
  authMiddleware,
  requirePermission("diagnosis:delete"),
  zValidator("param", idParamSchema),
  deleteDiagnosis,
);

export default diagnosisRouter;