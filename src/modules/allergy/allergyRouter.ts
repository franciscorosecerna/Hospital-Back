import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { TokenPayload } from "../authorization/authorizationService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requirePermission } from "../../middleware/permissionMiddleware";
import {
  createAllergyHandler,
  getbyIdHandler,
  getByPatientAndSustanciaHandler,
  getAllergiesByPatientHandler,
  updateAllergyHandler,
  removeAllergyHandler,
} from "./allergyController";
import {
  idParamSchema,
  patientIdParamSchema,
  patientAndSustanciaParamSchema,
  paginationQuerySchema,
  createAllergySchema,
  updateAllergySchema,
} from "./allergySchema";

export const allergyRouter = new Hono<{ Variables: { user: TokenPayload } }>();

allergyRouter.use("*", authMiddleware);

allergyRouter.get(
  "/:id",
  requirePermission("allergies:read"),
  zValidator("param", idParamSchema),
  getbyIdHandler
);

allergyRouter.get(
  "/patient/:patientId/sustancia/:sustancia",
  requirePermission("allergies:read"),
  zValidator("param", patientAndSustanciaParamSchema),
  getByPatientAndSustanciaHandler
);

allergyRouter.get(
  "/patient/:patientId",
  requirePermission("allergies:read"),
  zValidator("param", patientIdParamSchema),
  zValidator("query", paginationQuerySchema),
  getAllergiesByPatientHandler
);

allergyRouter.post(
  "/",
  requirePermission("allergies:write"),
  zValidator("json", createAllergySchema),
  createAllergyHandler
);

allergyRouter.patch(
  "/:id",
  requirePermission("allergies:write"),
  zValidator("param", idParamSchema),
  zValidator("json", updateAllergySchema),
  updateAllergyHandler
);

allergyRouter.delete(
  "/:id",
  requirePermission("allergies:write"),
  zValidator("param", idParamSchema),
  removeAllergyHandler
);
