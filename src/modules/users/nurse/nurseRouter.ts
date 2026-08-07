import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createNurseSchema, idParamSchema, paginationQuerySchema, updateNurseSchema } from "../userSchema";
import {
  createNurse,
  getNurses,
  getNursesByDepartment,
  getNursesByTurno,
  getNurseById,
  updateNurse,
  deleteNurse,
} from "./nurseController";
import { authMiddleware } from "../../../middleware/authMiddleware";
import { requirePermission } from "../../../middleware/permissionMiddleware";
import type { TokenPayload } from "../../authorization/authorizationService";

export const nurseRouter = new Hono<{ Variables: { user: TokenPayload } }>();

nurseRouter.post("/",
  authMiddleware,
  requirePermission("nurses:create"),
  zValidator("json", createNurseSchema),
  createNurse
);

nurseRouter.get("/",
  authMiddleware,
  requirePermission("nurses:read"),
  zValidator("query", paginationQuerySchema),
  getNurses
);

nurseRouter.get(
  "/by-department/:departmentId",
  authMiddleware,
  requirePermission("nurses:read"),
  zValidator("param", idParamSchema),
  zValidator("query", paginationQuerySchema),
  getNursesByDepartment
);

nurseRouter.get(
  "/by-turno/:turno",
  authMiddleware,
  requirePermission("nurses:read"),
  zValidator("param", z.object({ turno: z.string().min(1).max(64) })),
  zValidator("query", paginationQuerySchema),
  getNursesByTurno
);

nurseRouter.get(
  "/:id",
  authMiddleware,
  requirePermission("nurses:read"),
  zValidator("param", idParamSchema),
  getNurseById
);

nurseRouter.patch(
  "/:id",
  authMiddleware,
  requirePermission("nurses:write"),
  zValidator("param", idParamSchema),
  zValidator("json", updateNurseSchema),
  updateNurse
);

nurseRouter.delete(
  "/:id",
  authMiddleware,
  requirePermission("nurses:delete"),
  zValidator("param", idParamSchema),
  deleteNurse
);