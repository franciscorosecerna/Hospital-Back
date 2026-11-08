import type { ValidatedContext } from "../../utils/validator";
import type {
  BaseUserInput,
  ChangePasswordInput,
  DocumentoParam,
  IdParam,
  PaginationQuery,
  UpdateUserInput,
} from "./userSchema";
import {
  registerUser,
  findUserById,
  findUserByDocumento,
  listUsers,
  editUser,
  changePassword,
  removeUser,
} from "./userService";

export async function createUser(c: ValidatedContext<BaseUserInput>) {
  const input = c.req.valid("json");
  const performedBy = c.get("user")?.sub;
  const user = await registerUser(input, performedBy);
  return c.json(user, 201);
}

export async function getUsers(c: ValidatedContext<unknown, unknown, PaginationQuery>) {
  const { limit, page } = c.req.valid("query");
  const users = await listUsers(limit, page);
  return c.json(users);
}

export async function getUserByDocumento(c: ValidatedContext<unknown, DocumentoParam>) {
  const { tipoDocumento, documento } = c.req.valid("param");
  const user = await findUserByDocumento(tipoDocumento, documento);
  return c.json(user);
}

export async function getUserById(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const user = await findUserById(id);
  return c.json(user);
}

export async function updateUser(c: ValidatedContext<UpdateUserInput, IdParam>) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const performedBy = c.get("user").sub;
  const user = await editUser(id, input, performedBy);
  return c.json(user);
}

export async function updatePassword(c: ValidatedContext<ChangePasswordInput, IdParam>) {
  const { id } = c.req.valid("param");
  const { currentPassword, newPassword } = c.req.valid("json");
  const performedBy = c.get("user").sub;
  await changePassword(id, currentPassword, newPassword, performedBy);
  return c.json({ message: "Contraseña actualizada correctamente." });
}

export async function deleteUser(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const performedBy = c.get("user").sub;
  const user = await removeUser(id, performedBy);
  return c.json(user);
}