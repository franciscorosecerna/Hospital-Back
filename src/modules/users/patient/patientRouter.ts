import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createPatientSchema, idParamSchema, paginationQuerySchema, updatePatientSchema } from "../userSchema";
import {
  createPatient,
  getPatients,
  getPatientByHistoriaClinica,
  getPatientById,
  updatePatient,
  deletePatient,
} from "./patientController";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { requirePermission } from "../../../middleware/permissionMiddleware";
import type { TokenPayload } from "../../authorization/authorizationService";

export const patientRouter = new Hono<{ Variables: { user: TokenPayload } }>();;

patientRouter.post("/",
  authMiddleware,
  requirePermission("patients:create"),
  zValidator("json", createPatientSchema),
  createPatient
);

patientRouter.get("/",
  authMiddleware,
  requirePermission("patients:read"),
  zValidator("query", paginationQuerySchema),
  getPatients
);

patientRouter.get(
  "/by-historia/:numeroHistoriaClinica",
  authMiddleware,
  requirePermission("patients:read"),
  zValidator("param", z.object({ numeroHistoriaClinica: z.string() })),
  getPatientByHistoriaClinica
);

patientRouter.get(
  "/:id",
  authMiddleware,
  requirePermission("patients:read"),
  zValidator("param", idParamSchema),
  getPatientById
);

patientRouter.patch(
  "/:id",
  authMiddleware,
  requirePermission("patients:write"),
  zValidator("param", idParamSchema),
  zValidator("json", updatePatientSchema),
  updatePatient
);

patientRouter.delete(
  "/:id",
  authMiddleware,
  requirePermission("patients:delete"),
  zValidator("param", idParamSchema),
  deletePatient
);