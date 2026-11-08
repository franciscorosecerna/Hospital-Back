import { Hono } from "hono";
import type { TokenPayload } from "../authorization/authorizationService";
import {
  loginHandler,
  refreshHandler,
  logoutHandler,
  logoutAllHandler,
} from "./authController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { zValidator } from "../../utils/validator";
import { loginSchema, refreshTokenSchema } from "./authSchema";

export const authRouter = new Hono<{ Variables: { user: TokenPayload } }>();

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

export default authRouter;