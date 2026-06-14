import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createPatientSchema, idParamSchema, updatePatientSchema } from "../userSchema";
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

export const patientRouter = new Hono();

patientRouter.post("/", zValidator("json", createPatientSchema), createPatient);

patientRouter.get("/", authMiddleware, requirePermission("patients:read"), getPatients);

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