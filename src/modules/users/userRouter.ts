import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  baseUserSchema,
  changePasswordSchema,
  idParamSchema,
  updateUserSchema,
} from "./userSchema";
import {
  createUser,
  getUsers,
  getUserByDocumento,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
} from "./userController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requirePermission} from "../../middleware/permissionMiddleware";

export const userRouter = new Hono();

userRouter.post("/", zValidator("json", baseUserSchema), createUser);

userRouter.get("/", authMiddleware, requirePermission("users:read"), getUsers);

userRouter.get(
  "/by-documento/:tipoDocumento/:documento",
  authMiddleware,
  requirePermission("users:read"),
  zValidator("param", z.object({ tipoDocumento: z.string(), documento: z.string() })),
  getUserByDocumento
);

userRouter.get(
  "/:id",
  authMiddleware,
  requirePermission("users:read"),
  zValidator("param", idParamSchema),
  getUserById
);

userRouter.patch(
  "/:id",
  authMiddleware,
  requirePermission("users:write"),
  zValidator("param", idParamSchema),
  zValidator("json", updateUserSchema),
  updateUser
);

userRouter.patch(
  "/:id/password",
  authMiddleware,
  requirePermission("users:write", "users:change-password"),
  zValidator("param", idParamSchema),
  zValidator("json", changePasswordSchema),
  updatePassword
);

userRouter.delete(
  "/:id",
  authMiddleware,
  requirePermission("users:delete"),
  zValidator("param", idParamSchema),
  deleteUser
);