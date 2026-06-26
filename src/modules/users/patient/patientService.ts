import {
  createPatient,
  getPatientByUserId,
  getPatientByHistoriaClinica,
  getAllPatients,
  updatePatient,
  deletePatient,
  type Patient,
  type PatientWithUser,
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

export type SafePatientWithUser = { user: SafeUser; patient: Patient };

function toSafePatientWithUser({ user, patient }: PatientWithUser): SafePatientWithUser {
  return { user: toSafeUser(user), patient };
}

export async function registerPatient(
  input: CreatePatientInput,
  performedBy?: string
): Promise<SafePatientWithUser> {
  const userData = await buildBaseUser(input);
  const result = await createPatient(
    userData,
    { numeroHistoriaClinica: input.numeroHistoriaClinica, grupoSanguineo: input.grupoSanguineo },
    performedBy
  );
  return toSafePatientWithUser(result);
}

export async function findPatientByUserId(userId: string): Promise<SafePatientWithUser> {
  const result = await getPatientByUserId(userId);
  return toSafePatientWithUser(result);
}

export async function findPatientByHistoriaClinica(
  numeroHistoriaClinica: string
): Promise<SafePatientWithUser> {
  const result = await getPatientByHistoriaClinica(numeroHistoriaClinica);
  return toSafePatientWithUser(result);
}

export async function listPatients(
  limit: number = 50,
  page: number = 1
): Promise<SafePatientWithUser[]> {
  const offset = (page - 1) * limit;
  const results = await getAllPatients(limit, offset);
  return results.map(toSafePatientWithUser);
}

export async function editPatient(
  userId: string,
  input: UpdatePatientInput,
  performedBy?: string
): Promise<SafePatientWithUser> {
  const result = await updatePatient(userId, input, performedBy);
  return toSafePatientWithUser(result);
}

export async function removePatient(userId: string, performedBy?: string): Promise<void> {
  await deletePatient(userId, performedBy);
}