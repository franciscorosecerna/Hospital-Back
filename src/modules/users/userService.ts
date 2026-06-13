import argon from "argon2";
import { v4 as uuidv4 } from "uuid";
import {
  createUser,
  getUserById,
  getUserByDocumento,
  getAllUsers,
  updateUser,
  updatePassword,
  deleteUser,
  type User,
} from "./userRepository";
import { InvalidCredentialsException } from "../../utils/exceptions";

export type SafeUser = Omit<User, "password">;

export type CreateUserInput = {
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  documento: string;
  fechaNacimiento: Date;
  password: string;
};

export type UpdateUserInput = Partial<
  Omit<CreateUserInput, "password" | "tipoDocumento" | "documento">
>;

export function toSafeUser(user: User): SafeUser {
  const { password: _, ...safe } = user;
  return safe;
}

export async function buildBaseUser(input: CreateUserInput) {
  const hashedPassword = await argon.hash(input.password);
  const now = new Date();
  return {
    id: uuidv4(),
    nombre: input.nombre,
    apellido: input.apellido,
    tipoDocumento: input.tipoDocumento,
    documento: input.documento,
    fechaNacimiento: input.fechaNacimiento.toISOString().slice(0, 10),
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
    isActive: true,
    deletedAt: null,
  };
}

export async function registerUser(input: CreateUserInput): Promise<SafeUser> {
  const data = await buildBaseUser(input);
  const user = await createUser(data);
  return toSafeUser(user);
}

export async function findUserById(id: string): Promise<SafeUser> {
  const user = await getUserById(id);
  return toSafeUser(user);
}

export async function findUserByDocumento(
  tipoDocumento: string,
  documento: string
): Promise<SafeUser> {
  const user = await getUserByDocumento(tipoDocumento, documento);
  return toSafeUser(user);
}

export async function listUsers(
  limit: number = 50,
  page: number = 0
): Promise<SafeUser[]> {
  const offset = (page - 1) * limit;
  const users = await getAllUsers(limit, offset);
  return users.map(toSafeUser);
}

export async function editUser(
  id: string,
  input: UpdateUserInput
): Promise<SafeUser> {
  const updateData = {
    ...input,
    fechaNacimiento: input.fechaNacimiento?.toISOString().slice(0, 10),
  };
  const user = await updateUser(id, updateData);
  return toSafeUser(user);
}

export async function changePassword(
  id: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await getUserById(id);

  const isValid = await argon.verify(user.password, currentPassword);
  if (!isValid) throw new InvalidCredentialsException();

  const hashedPassword = await argon.hash(newPassword);
  await updatePassword(id, hashedPassword);
}

export async function removeUser(id: string): Promise<SafeUser> {
  const user = await deleteUser(id);
  return toSafeUser(user);
}