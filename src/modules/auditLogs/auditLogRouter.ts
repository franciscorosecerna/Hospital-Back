import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  getAuditLogByIdHandler,
  getAllAuditLogsHandler,
  createAuditLogHandler,
} from "./auditLogController";
import {
  auditLogParamSchema,
  auditLogQuerySchema,
  createAuditLogSchema,
} from "./auditLogSchema";
import { authMiddleware } from "../../middleware/authMiddleware";
import {requireRole } from "../../middleware/permissionMiddleware";
import type { TokenPayload } from "../authorization/authorizationService";

const auditLogRouter = new Hono<{ Variables: { user: TokenPayload } }>();

auditLogRouter.get(
  "/",
  authMiddleware,
  requireRole("admin"),
  zValidator("query", auditLogQuerySchema),
  getAllAuditLogsHandler,
);

auditLogRouter.get(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  zValidator("param", auditLogParamSchema),
  getAuditLogByIdHandler,
);

auditLogRouter.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  zValidator("json", createAuditLogSchema),
  createAuditLogHandler,
);

export default auditLogRouter;