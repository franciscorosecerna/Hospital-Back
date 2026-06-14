import { getUserById } from "../userRepository";
import {
  createPatient,
  getPatientByUserId,
  getPatientByHistoriaClinica,
  getAllPatients,
  updatePatient,
  deletePatient,
  type Patient,
} from "./patientRepository";
import {
  buildBaseUser,
  toSafeUser,
  type SafeUser,
  type CreateUserInput,
} from "../userService";

export type CreatePatientInput = CreateUserInput & {
  numeroHistoriaClinica?: string;
  grupoSanguineo?: string;
};

export type UpdatePatientInput = Partial<
  Pick<CreatePatientInput, "numeroHistoriaClinica" | "grupoSanguineo">
>;

export async function registerPatient(
  input: CreatePatientInput
): Promise<{ user: SafeUser; patient: Patient }> {
  const userData = await buildBaseUser(input);
  const { user, patient } = await createPatient(userData, {
    numeroHistoriaClinica: input.numeroHistoriaClinica,
    grupoSanguineo: input.grupoSanguineo,
  });
  return { user: toSafeUser(user), patient };
}

export async function findPatientByUserId(
  userId: string
): Promise<{ user: SafeUser; patient: Patient }> {
  const [user, patient] = await Promise.all([
    getUserById(userId),
    getPatientByUserId(userId),
  ]);
  return { user: toSafeUser(user), patient };
}

export async function editPatient(
  userId: string,
  input: UpdatePatientInput
): Promise<Patient> {
  return updatePatient(userId, input);
}

export async function removePatient(userId: string): Promise<void> {
  await deletePatient(userId);
}

export async function findPatientByHistoriaClinica(
  numeroHistoriaClinica: string
): Promise<Patient> {
  return getPatientByHistoriaClinica(numeroHistoriaClinica);
}

export async function listPatients(
  limit: number = 50, 
  page: number = 0
): Promise<Patient[]> {
  const offset = (page - 1) * limit;
  return getAllPatients(limit, offset);
}