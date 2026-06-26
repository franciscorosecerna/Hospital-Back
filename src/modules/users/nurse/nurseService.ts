import {
  createNurse,
  getNurseByUserId,
  getNursesByDepartment,
  getNursesByTurno,
  getAllNurses,
  updateNurse,
  deleteNurse,
  type Nurse,
  type NurseWithUser,
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

export type SafeNurseWithUser = { user: SafeUser; nurse: Nurse };

function toSafeNurseWithUser({ user, nurse }: NurseWithUser): SafeNurseWithUser {
  return { user: toSafeUser(user), nurse };
}

export async function registerNurse(
  input: CreateNurseInput,
  performedBy?: string
): Promise<SafeNurseWithUser> {
  const userData = await buildBaseUser(input);
  const result = await createNurse(
    userData,
    { departmentId: input.departmentId, turno: input.turno },
    performedBy
  );
  return toSafeNurseWithUser(result);
}

export async function findNurseByUserId(userId: string): Promise<SafeNurseWithUser> {
  const result = await getNurseByUserId(userId);
  return toSafeNurseWithUser(result);
}

export async function editNurse(
  userId: string,
  input: UpdateNurseInput,
  performedBy?: string
): Promise<SafeNurseWithUser> {
  const result = await updateNurse(userId, input, performedBy);
  return toSafeNurseWithUser(result);
}

export async function removeNurse(userId: string, performedBy?: string): Promise<void> {
  await deleteNurse(userId, performedBy);
}

export async function listNursesByDepartment(
  departmentId: string,
  limit: number = 50,
  page: number = 1
): Promise<SafeNurseWithUser[]> {
  const offset = (page - 1) * limit;
  const results = await getNursesByDepartment(departmentId, limit, offset);
  return results.map(toSafeNurseWithUser);
}

export async function listNursesByTurno(
  turno: string,
  limit: number = 50,
  page: number = 1
): Promise<SafeNurseWithUser[]> {
  const offset = (page - 1) * limit;
  const results = await getNursesByTurno(turno, limit, offset);
  return results.map(toSafeNurseWithUser);
}

export async function listNurses(
  limit: number = 50,
  page: number = 1
): Promise<SafeNurseWithUser[]> {
  const offset = (page - 1) * limit;
  const results = await getAllNurses(limit, offset);
  return results.map(toSafeNurseWithUser);
}