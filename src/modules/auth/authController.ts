import type { Context } from "hono";
import { login, refresh, logout, logoutAll} from "./authService";

export async function loginHandler(c: Context) {
  const input = c.req.valid("json" as never);
  const user = await login(input);
  return c.json(user, 200);
}

export async function refreshHandler(c: Context) {
  const { refreshToken } = c.req.valid("json" as never);
  const tokens = await refresh(refreshToken);
  return c.json(tokens, 200);
}

export async function logoutHandler(c: Context) {
  const { refreshToken } = c.req.valid("json" as never);
  await logout(refreshToken);
  return c.json("", 200);
}

export async function logoutAllHandler(c: Context) {
  const input = c.req.valid("param" as never);
  await logoutAll(input);
  return c.json("", 200);
}