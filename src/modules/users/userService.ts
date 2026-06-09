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
import { InvalidCredentialsException} from "../../utils/exceptions";

export type SafeUser = Omit<User, "password">;

export type CreateUserInput = {
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  documento: string;
  fechaNacimiento: Date;
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
  const hashedPassword = await argon.hash(input.password);
  return {
    id: uuidv4(),
    nombre: input.nombre,
    apellido: input.apellido,
    tipoDocumento: input.tipoDocumento,
    documento: input.documento,
    fechaNacimiento: input.fechaNacimiento.toISOString().slice(0, 10),
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

export async function listUsers(limit: number = 50, offset: number = 0): Promise<SafeUser[]> {
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