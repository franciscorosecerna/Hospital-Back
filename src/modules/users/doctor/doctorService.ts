import { getUserById } from "../userRepository";
import {
  createDoctor,
  getDoctorByUserId,
  getDoctorByMatricula,
  getAllDoctors,
  updateDoctor,
  deleteDoctor,
  type Doctor,
} from "./doctorRepository";
import {
  buildBaseUser,
  toSafeUser,
  type SafeUser,
  type CreateUserInput,
} from "../userService";

export type CreateDoctorInput = CreateUserInput & {
  matricula: string;
  especialidad?: string;
};

export type UpdateDoctorInput = Partial<
  Pick<CreateDoctorInput, "matricula" | "especialidad">
>;

export async function registerDoctor(
  input: CreateDoctorInput
): Promise<{ user: SafeUser; doctor: Doctor }> {
  const userData = await buildBaseUser(input);
  const { user, doctor } = await createDoctor(userData, {
    matricula: input.matricula,
    especialidad: input.especialidad,
  });
  return { user: toSafeUser(user), doctor };
}

export async function findDoctorByUserId(
  userId: string
): Promise<{ user: SafeUser; doctor: Doctor }> {
  const [user, doctor] = await Promise.all([
    getUserById(userId),
    getDoctorByUserId(userId),
  ]);
  return { user: toSafeUser(user), doctor };
}

export async function editDoctor(
  userId: string,
  input: UpdateDoctorInput
): Promise<Doctor> {
  return updateDoctor(userId, input);
}

export async function removeDoctor(userId: string): Promise<void> {
  await deleteDoctor(userId);
}

export async function findDoctorByMatricula(matricula: string): Promise<Doctor> {
  return getDoctorByMatricula(matricula);
}

export async function listDoctors(
  limit: number = 50,
  page: number = 0
): Promise<Doctor[]> {
  const offset = (page - 1) * limit;
  return getAllDoctors(limit, offset);
}
