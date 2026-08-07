import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createDoctorSchema, idParamSchema, paginationQuerySchema, updateDoctorSchema } from "../userSchema";
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
import type { TokenPayload } from "../../authorization/authorizationService";

export const doctorRouter = new Hono<{ Variables: { user: TokenPayload } }>();;

doctorRouter.post("/",
  authMiddleware,
  requirePermission("doctors:create"),
  zValidator("json", createDoctorSchema),
  createDoctor
);

doctorRouter.get("/",
  authMiddleware,
  requirePermission("doctors:read"),
  zValidator("query", paginationQuerySchema),
  getDoctors
);

doctorRouter.get(
  "/by-matricula/:matricula",
  authMiddleware,
  requirePermission("doctors:read"),
  zValidator("param", z.object({ matricula: z.string() })),
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