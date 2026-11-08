import { Hono } from "hono";
import {
  baseUserSchema,
  changePasswordSchema,
  documentoParamSchema,
  idParamSchema,
  paginationQuerySchema,
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
import { requirePermission } from "../../middleware/permissionMiddleware";
import { zValidator } from "../../utils/validator";
import type { TokenPayload } from "../authorization/authorizationService";

export const userRouter = new Hono<{ Variables: { user: TokenPayload } }>();

userRouter.post("/", zValidator("json", baseUserSchema), createUser);

userRouter.get(
  "/",
  authMiddleware,
  requirePermission("users:read"),
  zValidator("query", paginationQuerySchema),
  getUsers
);

userRouter.get(
  "/by-documento/:tipoDocumento/:documento",
  authMiddleware,
  requirePermission("users:read"),
  zValidator("param", documentoParamSchema),
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

export default userRouter;