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

const auditLogRouter = new Hono();

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