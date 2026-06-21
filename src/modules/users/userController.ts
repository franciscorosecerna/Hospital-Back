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

export async function createUser(c: Context) {
  const input = c.req.valid("json" as never);
  const user = await registerUser(input);
  return c.json(user, 201);
}

export async function getUsers(c: Context) {
  const limit = Number(c.req.query("limit") ?? 50);
  const page = Number(c.req.query("page") ?? 1);
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

export async function updateUser(c: Context) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const user = await editUser(id, input);
  return c.json(user);
}

export async function updatePassword(c: Context) {
  const { id } = c.req.valid("param" as never);
  const { currentPassword, newPassword } = c.req.valid("json" as never);
  await changePassword(id, currentPassword, newPassword);
  return c.json({ message: "Contraseña actualizada correctamente." });
}

export async function deleteUser(c: Context) {
  const { id } = c.req.valid("param" as never);
  const user = await removeUser(id);
  return c.json(user);
}