import type { Context } from "hono";
import {
  registerUser,
  findUserById,
  findUserByDocumento,
  listUsers,
  editUser,
  changePassword,
  removeUser,
} from "./userService";
import type { TokenPayload } from "../authorization/authorizationService";

type AuthedContext = Context<{ Variables: { user: TokenPayload } }>;

export async function createUser(c: AuthedContext) {
  const input = c.req.valid("json" as never);
  const performedBy = c.get("user").sub;
  const user = await registerUser(input, performedBy);
  return c.json(user, 201);
}

export async function getUsers(c: Context) {
  const { limit, page } = c.req.valid("query" as never);
  const users = await listUsers(limit, page);
  return c.json(users);
}

export async function getUserByDocumento(c: Context) {
  const { tipoDocumento, documento } = c.req.valid("param" as never);
  const user = await findUserByDocumento(tipoDocumento, documento);
  return c.json(user);
}

export async function getUserById(c: Context) {
  const { id } = c.req.valid("param" as never);
  const user = await findUserById(id);
  return c.json(user);
}

export async function updateUser(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const performedBy = c.get("user").sub;
  const user = await editUser(id, input, performedBy);
  return c.json(user);
}

export async function updatePassword(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const { currentPassword, newPassword } = c.req.valid("json" as never);
  const performedBy = c.get("user").sub;
  await changePassword(id, currentPassword, newPassword, performedBy);
  return c.json({ message: "Contraseña actualizada correctamente." });
}

export async function deleteUser(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const performedBy = c.get("user").sub;
  const user = await removeUser(id, performedBy);
  return c.json(user);
}