import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  loginHandler,
  refreshHandler,
  logoutHandler,
  logoutAllHandler,
} from "./authController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { loginSchema, refreshTokenSchema } from "./authSchema";

export const authRouter = new Hono();
 
authRouter.post("/login", zValidator("json", loginSchema), loginHandler);

authRouter.post(
  "/refresh",
  zValidator("json", refreshTokenSchema),
  refreshHandler
);

authRouter.post(
  "/logout",
  authMiddleware,
  zValidator("json", refreshTokenSchema),
  logoutHandler
);

authRouter.post("/logout-all", authMiddleware, logoutAllHandler);