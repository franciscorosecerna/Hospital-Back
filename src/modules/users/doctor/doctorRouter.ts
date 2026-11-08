import { Hono } from "hono";
import {
  createDoctorSchema,
  idParamSchema,
  matriculaParamSchema,
  paginationQuerySchema,
  updateDoctorSchema,
} from "../userSchema";
import {
  createDoctor,
  getDoctors,
  getDoctorByMatricula,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from "./doctorController";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { requirePermission } from "../../../middleware/permissionMiddleware";
import { zValidator } from "../../../utils/validator";
import type { TokenPayload } from "../../authorization/authorizationService";

export const doctorRouter = new Hono<{ Variables: { user: TokenPayload } }>();

doctorRouter.post(
  "/",
  authMiddleware,
  requirePermission("doctors:create"),
  zValidator("json", createDoctorSchema),
  createDoctor
);

doctorRouter.get(
  "/",
  authMiddleware,
  requirePermission("doctors:read"),
  zValidator("query", paginationQuerySchema),
  getDoctors
);

doctorRouter.get(
  "/by-matricula/:matricula",
  authMiddleware,
  requirePermission("doctors:read"),
  zValidator("param", matriculaParamSchema),
  getDoctorByMatricula
);

doctorRouter.get(
  "/:id",
  authMiddleware,
  requirePermission("doctors:read"),
  zValidator("param", idParamSchema),
  getDoctorById
);

doctorRouter.patch(
  "/:id",
  authMiddleware,
  requirePermission("doctors:write"),
  zValidator("param", idParamSchema),
  zValidator("json", updateDoctorSchema),
  updateDoctor
);

doctorRouter.delete(
  "/:id",
  authMiddleware,
  requirePermission("doctors:delete"),
  zValidator("param", idParamSchema),
  deleteDoctor
);

export default doctorRouter;