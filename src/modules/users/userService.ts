import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import {
  createUser,
  getUserById,
  getUserByDocumento,
  getAllUsers,
  updateUser,
  updatePassword,
  deleteUser,
  getDoctorByUserId,
  getDoctorByMatricula,
  getAllDoctors,
  updateDoctor,
  getPatientByUserId,
  getPatientByHistoriaClinica,
  getAllPatients,
  updatePatient,
  getNurseByUserId,
  getNursesByDepartment,
  getNursesByTurno,
  getAllNurses,
  updateNurse,
  createUserWithDoctor,
  deleteUserWithDoctor,
  createUserWithPatient,
  deleteUserWithPatient,
  createUserWithNurse,
  deleteUserWithNurse,
  type User,
  type Doctor,
  type Patient,
  type Nurse,
} from "./userRepository";
import { HTTPException } from "hono/http-exception";

const SALT_ROUNDS = 12;

export type SafeUser = Omit<User, "password">;

export type CreateUserInput = {
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  documento: string;
  fechaNacimiento: string;
  password: string;
};

export type CreateDoctorInput = CreateUserInput & {
  matricula: string;
  especialidad?: string;
};

export type CreatePatientInput = CreateUserInput & {
  numeroHistoriaClinica?: string;
  grupoSanguineo?: string;
};

export type CreateNurseInput = CreateUserInput & {
  departmentId: string;
  turno: string;
};

export type UpdateUserInput = Partial<
  Omit<CreateUserInput, "password" | "tipoDocumento" | "documento">
>;

function toSafeUser(user: User): SafeUser {
  const { password: _, ...safe } = user;
  return safe;
}

async function buildBaseUser(input: CreateUserInput) {
  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  return {
    id: uuidv4(),
    nombre: input.nombre,
    apellido: input.apellido,
    tipoDocumento: input.tipoDocumento,
    documento: input.documento,
    fechaNacimiento: input.fechaNacimiento,
    password: hashedPassword,
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

export async function listUsers(): Promise<SafeUser[]> {
  const users = await getAllUsers();
  return users.map(toSafeUser);
}

export async function editUser(
  id: string,
  input: UpdateUserInput
): Promise<SafeUser> {
  const user = await updateUser(id, input);
  return toSafeUser(user);
}

export async function changePassword(
  id: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await getUserById(id);

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new HTTPException(401, { message: "Credenciales inválidas." });

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await updatePassword(id, hashedPassword);
}

export async function removeUser(id: string): Promise<SafeUser> {
  const user = await deleteUser(id);
  return toSafeUser(user);
}

export async function registerDoctor(
  input: CreateDoctorInput
): Promise<{ user: SafeUser; doctor: Doctor }> {
  const userData = await buildBaseUser(input);
  const { user, doctor } = await createUserWithDoctor(userData, {
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

export { getDoctorByMatricula, getAllDoctors };

export async function editDoctor(
  userId: string,
  input: Partial<Pick<CreateDoctorInput, "matricula" | "especialidad">>
): Promise<Doctor> {
  return updateDoctor(userId, input);
}

export async function removeDoctor(userId: string): Promise<void> {
  await deleteUserWithDoctor(userId);
}

export async function registerPatient(
  input: CreatePatientInput
): Promise<{ user: SafeUser; patient: Patient }> {
  const userData = await buildBaseUser(input);
  const { user, patient } = await createUserWithPatient(userData, {
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

export { getPatientByHistoriaClinica, getAllPatients };

export async function editPatient(
  userId: string,
  input: Partial<Pick<CreatePatientInput, "numeroHistoriaClinica" | "grupoSanguineo">>
): Promise<Patient> {
  return updatePatient(userId, input);
}

export async function removePatient(userId: string): Promise<void> {
  await deleteUserWithPatient(userId);
}

export async function registerNurse(
  input: CreateNurseInput
): Promise<{ user: SafeUser; nurse: Nurse }> {
  const userData = await buildBaseUser(input);
  const { user, nurse } = await createUserWithNurse(userData, {
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

export { getNursesByDepartment, getNursesByTurno, getAllNurses };

export async function editNurse(
  userId: string,
  input: Partial<Pick<CreateNurseInput, "departmentId" | "turno">>
): Promise<Nurse> {
  return updateNurse(userId, input);
}

export async function removeNurse(userId: string): Promise<void> {
  await deleteUserWithNurse(userId);
}