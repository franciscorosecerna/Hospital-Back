import { getUserById } from "../userRepository";
import {
  createNurse,
  getNurseByUserId,
  getNursesByDepartment,
  getNursesByTurno,
  getAllNurses,
  updateNurse,
  deleteNurse,
  type Nurse,
} from "./nurseRepository";
import {
  buildBaseUser,
  toSafeUser,
  type SafeUser,
  type CreateUserInput,
} from "../userService";

export type CreateNurseInput = CreateUserInput & {
  departmentId: string;
  turno: string;
};

export type UpdateNurseInput = Partial<
  Pick<CreateNurseInput, "departmentId" | "turno">
>;

export async function registerNurse(
  input: CreateNurseInput
): Promise<{ user: SafeUser; nurse: Nurse }> {
  const userData = await buildBaseUser(input);
  const { user, nurse } = await createNurse(userData, {
    departmentId: input.departmentId,
    turno: input.turno,
  });
  return { user: toSafeUser(user), nurse };
}

export async function findNurseByUserId(
  userId: string
): Promise<{ user: SafeUser; nurse: Nurse }> {
  const [user, nurse] = await Promise.all([
    getUserById(userId),
    getNurseByUserId(userId),
  ]);
  return { user: toSafeUser(user), nurse };
}

export async function editNurse(
  userId: string,
  input: UpdateNurseInput
): Promise<Nurse> {
  return updateNurse(userId, input);
}

export async function removeNurse(userId: string): Promise<void> {
  await deleteNurse(userId);
}

export async function listNursesByDepartment(departmentId: string): Promise<Nurse[]> {
  return getNursesByDepartment(departmentId);
}

export async function listNursesByTurno(turno: string): Promise<Nurse[]> {
  return getNursesByTurno(turno);
}

export async function listAllNurses(
  limit: number = 50,
  page: number = 0
): Promise<Nurse[]> {
  const offset = (page - 1) * limit;
  return getAllNurses(limit, offset);
}