import { Hono } from "hono";
import type { TokenPayload } from "../authorization/authorizationService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requirePermission, requireRole } from "../../middleware/permissionMiddleware";
import { zValidator } from "../../utils/validator";
import {
  createMedication,
  deleteMedication,
  getMedication,
  listMedications,
  updateMedication,
} from "./medicationController";
import {
  createMedicationSchema,
  idParamSchema,
  medicationSearchQuerySchema,
  updateMedicationSchema,
} from "./medicationSchema";

export const medicationRouter = new Hono<{ Variables: { user: TokenPayload } }>();

medicationRouter.get(
  "/",
  authMiddleware,
  requireRole("admin", "doctor", "nurse", "patient"),
  requirePermission("medications:read"),
  zValidator("query", medicationSearchQuerySchema),
  listMedications,
);

medicationRouter.get(
  "/:id",
  authMiddleware,
  requireRole("admin", "doctor", "nurse", "patient"),
  requirePermission("medications:read"),
  zValidator("param", idParamSchema),
  getMedication,
);

medicationRouter.post(
  "/",
  authMiddleware,
  requireRole("admin", "doctor"),
  requirePermission("medications:create"),
  zValidator("json", createMedicationSchema),
  createMedication,
);

medicationRouter.patch(
  "/:id",
  authMiddleware,
  requireRole("admin", "doctor"),
  requirePermission("medications:update"),
  zValidator("param", idParamSchema),
  zValidator("json", updateMedicationSchema),
  updateMedication,
);

medicationRouter.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  requirePermission("medications:delete"),
  zValidator("param", idParamSchema),
  deleteMedication,
);

export default medicationRouter;