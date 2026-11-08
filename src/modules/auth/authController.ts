import type { ValidatedContext } from "../../utils/validator";
import type { LoginInput, RefreshTokenInput } from "./authSchema";
import { login, refresh, logout, logoutAll } from "./authService";

export async function loginHandler(c: ValidatedContext<LoginInput>) {
  const input = c.req.valid("json");
  const user = await login(input);
  return c.json(user, 200);
}

export async function refreshHandler(c: ValidatedContext<RefreshTokenInput>) {
  const { refreshToken } = c.req.valid("json");
  const tokens = await refresh(refreshToken);
  return c.json(tokens, 200);
}

export async function logoutHandler(c: ValidatedContext<RefreshTokenInput>) {
  const { refreshToken } = c.req.valid("json");
  await logout(refreshToken);
  return c.json("", 200);
}

export async function logoutAllHandler(c: ValidatedContext) {
  const userId = c.get("user").sub;
  await logoutAll(userId);
  return c.json("", 200);
}