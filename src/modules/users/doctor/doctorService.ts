import {
  createDoctor,
  getDoctorByUserId,
  getDoctorByMatricula,
  getAllDoctors,
  updateDoctor,
  deleteDoctor,
  type Doctor,
  type DoctorWithUser,
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

export type SafeDoctorWithUser = { user: SafeUser; doctor: Doctor };

function toSafeDoctorWithUser({ user, doctor }: DoctorWithUser): SafeDoctorWithUser {
  return { user: toSafeUser(user), doctor };
}

export async function registerDoctor(
  input: CreateDoctorInput,
  performedBy?: string
): Promise<SafeDoctorWithUser> {
  const userData = await buildBaseUser(input);
  const result = await createDoctor(
    userData,
    { matricula: input.matricula, especialidad: input.especialidad },
    performedBy
  );
  return toSafeDoctorWithUser(result);
}

export async function findDoctorByUserId(userId: string): Promise<SafeDoctorWithUser> {
  const result = await getDoctorByUserId(userId);
  return toSafeDoctorWithUser(result);
}

export async function findDoctorByMatricula(matricula: string): Promise<SafeDoctorWithUser> {
  const result = await getDoctorByMatricula(matricula);
  return toSafeDoctorWithUser(result);
}

export async function listDoctors(
  limit: number = 50,
  page: number = 1
): Promise<SafeDoctorWithUser[]> {
  const offset = (page - 1) * limit;
  const results = await getAllDoctors(limit, offset);
  return results.map(toSafeDoctorWithUser);
}

export async function editDoctor(
  userId: string,
  input: UpdateDoctorInput,
  performedBy?: string
): Promise<SafeDoctorWithUser> {
  const result = await updateDoctor(userId, input, performedBy);
  return toSafeDoctorWithUser(result);
}

export async function removeDoctor(userId: string, performedBy?: string): Promise<void> {
  await deleteDoctor(userId, performedBy);
}