import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { users, doctors, patients, nurses } from "../../db/schema/users";
import { parsePgError, RecordNotFoundException } from "../../utils/exceptions";

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type NewDoctor = typeof doctors.$inferInsert;
export type Doctor = typeof doctors.$inferSelect;

export type NewPatient = typeof patients.$inferInsert;
export type Patient = typeof patients.$inferSelect;

export type NewNurse = typeof nurses.$inferInsert;
export type Nurse = typeof nurses.$inferSelect;

export async function createUser(data: NewUser): Promise<User> {
  let result: User | undefined;
  try {
    [result] = await db.insert(users).values(data).returning();
  } catch (err) {
    throw parsePgError(err);
  }
  if (!result) throw new Error("Failed to create user");
  return result;
}

export async function getUserById(id: string): Promise<User> {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if(!user) throw new RecordNotFoundException("users", id);
    return user;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getUserByDocumento(
  tipoDocumento: string,
  documento: string
): Promise<User> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.tipoDocumento, tipoDocumento),
          eq(users.documento, documento)
        )
      );
    if (!user) throw new RecordNotFoundException("users", `${tipoDocumento}:${documento}`);
    return user;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
  try {
    return await db.select().from(users).limit(limit).offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateUser(
  id: string,
  data: Partial<Omit<NewUser, "id">>
): Promise<User> {
  try {
    const [updated] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    if (!updated) throw new RecordNotFoundException("users", id);
    return updated;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updatePassword(
  id: string,
  hashedPassword: string
): Promise<void> {
  try {
    const [updated] = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id))
      .returning({ id: users.id });
    if (!updated) throw new RecordNotFoundException("users", id);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteUser(id: string): Promise<User> {
  try {
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning();
    if (!deleted) throw new RecordNotFoundException("users", id);
    return deleted;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createDoctor(data: NewDoctor): Promise<Doctor> {
  let result: Doctor | undefined;
  try {
    [result] = await db.insert(doctors).values(data).returning();
  } catch (err) {
    throw parsePgError(err);
  }
  if (!result) throw new Error("Failed to create doctor");
  return result;
}

export async function getDoctorByUserId(userId: string): Promise<Doctor> {
  try {
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, userId));
    if (!doctor) throw new RecordNotFoundException("doctors", userId);
    return doctor;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getDoctorByMatricula(matricula: string): Promise<Doctor> {
  try {
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.matricula, matricula));
    if (!doctor) throw new RecordNotFoundException("doctors", matricula);
    return doctor;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllDoctors(limit: number = 50, offset: number = 0): Promise<Doctor[]> {
  try {
    return await db.select().from(doctors).limit(limit).offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateDoctor(
  userId: string,
  data: Partial<Omit<NewDoctor, "userId">>
): Promise<Doctor> {
  try {
    const [updated] = await db
      .update(doctors)
      .set(data)
      .where(eq(doctors.userId, userId))
      .returning();
    if (!updated) throw new RecordNotFoundException("doctors", userId);
    return updated;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteDoctor(userId: string): Promise<Doctor> {
  try {
    const [deleted] = await db
      .delete(doctors)
      .where(eq(doctors.userId, userId))
      .returning();
    if (!deleted) throw new RecordNotFoundException("doctors", userId);
    return deleted;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createPatient(data: NewPatient): Promise<Patient> {
  let result: Patient | undefined;
  try {
    [result] = await db.insert(patients).values(data).returning();
  } catch (err) {
    throw parsePgError(err);
  }
  if (!result) throw new Error("Failed to create patient");
  return result;
}

export async function getPatientByUserId(userId: string): Promise<Patient> {
  try {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, userId));
    if (!patient) throw new RecordNotFoundException("patients", userId);
    return patient;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getPatientByHistoriaClinica(
  numeroHistoriaClinica: string
): Promise<Patient> {
  try {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.numeroHistoriaClinica, numeroHistoriaClinica));
    if (!patient) throw new RecordNotFoundException("patients", numeroHistoriaClinica);
    return patient;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllPatients(limit: number = 50, offset: number = 0): Promise<Patient[]> {
  try {
    return await db.select().from(patients).limit(limit).offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updatePatient(
  userId: string,
  data: Partial<Omit<NewPatient, "userId">>
): Promise<Patient> {
  try {
    const [updated] = await db
      .update(patients)
      .set(data)
      .where(eq(patients.userId, userId))
      .returning();
    if (!updated) throw new RecordNotFoundException("patients", userId);
    return updated;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deletePatient(userId: string): Promise<Patient> {
  try {
    const [deleted] = await db
      .delete(patients)
      .where(eq(patients.userId, userId))
      .returning();
    if (!deleted) throw new RecordNotFoundException("patients", userId);
    return deleted;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createNurse(data: NewNurse): Promise<Nurse> {
  let result: Nurse | undefined;
  try {
    [result] = await db.insert(nurses).values(data).returning();
  } catch (err) {
    throw parsePgError(err);
  }
  if (!result) throw new Error("Failed to create nurse");
  return result;
}

export async function getNurseByUserId(userId: string): Promise<Nurse> {
  try {
    const [nurse] = await db
      .select()
      .from(nurses)
      .where(eq(nurses.userId, userId));
    if (!nurse) throw new RecordNotFoundException("nurses", userId);
    return nurse;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getNursesByDepartment(departmentId: string): Promise<Nurse[]> {
  try {
    return await db
      .select()
      .from(nurses)
      .where(eq(nurses.departmentId, departmentId));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getNursesByTurno(turno: string): Promise<Nurse[]> {
  try {
    return await db.select().from(nurses).where(eq(nurses.turno, turno));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllNurses(limit: number = 50, offset: number = 0): Promise<Nurse[]> {
  try {
    return await db.select().from(nurses).limit(limit).offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function updateNurse(
  userId: string,
  data: Partial<Omit<NewNurse, "userId">>
): Promise<Nurse> {
  try {
    const [updated] = await db
      .update(nurses)
      .set(data)
      .where(eq(nurses.userId, userId))
      .returning();
    if (!updated) throw new RecordNotFoundException("nurses", userId);
    return updated;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteNurse(userId: string): Promise<Nurse> {
  try {
    const [deleted] = await db
      .delete(nurses)
      .where(eq(nurses.userId, userId))
      .returning();
    if (!deleted) throw new RecordNotFoundException("nurses", userId);
    return deleted;
  } catch (err) {
    throw parsePgError(err);
  }
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function insertUser(tx: Tx, data: NewUser): Promise<User> {
  const [user] = await tx.insert(users).values(data).returning();
  if (!user) throw new Error("Failed to create user");
  return user;
}

async function deleteUserTx(tx: Tx, id: string): Promise<void> {
  const [deleted] = await tx.delete(users).where(eq(users.id, id)).returning({ id: users.id });
  if (!deleted) throw new RecordNotFoundException("users", id);
}

export async function createUserWithDoctor(
  userData: NewUser,
  doctorData: Omit<NewDoctor, "userId">
): Promise<{ user: User; doctor: Doctor }> {
  try {
    return await db.transaction(async (tx) => {
      const user = await insertUser(tx, userData);
      const [doctor] = await tx
        .insert(doctors)
        .values({ ...doctorData, userId: user.id })
        .returning();
      if (!doctor) throw new Error("Failed to create doctor");
      return { user, doctor };
    });
  } catch (err) {
    if (err instanceof Error && !("code" in err)) throw err;
    throw parsePgError(err);
  }
}

export async function deleteUserWithDoctor(
  userId: string
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(doctors)
        .where(eq(doctors.userId, userId))
        .returning({ userId: doctors.userId });
      if (!deleted) throw new RecordNotFoundException("doctors", userId);
      await deleteUserTx(tx, userId);
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createUserWithPatient(
  userData: NewUser,
  patientData: Omit<NewPatient, "userId">
): Promise<{ user: User; patient: Patient }> {
  try {
    return await db.transaction(async (tx) => {
      const user = await insertUser(tx, userData);
      const [patient] = await tx
        .insert(patients)
        .values({ ...patientData, userId: user.id })
        .returning();
      if (!patient) throw new Error("Failed to create patient");
      return { user, patient };
    });
  } catch (err) {
    if (err instanceof Error && !("code" in err)) throw err;
    throw parsePgError(err);
  }
}

export async function deleteUserWithPatient(
  userId: string
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(patients)
        .where(eq(patients.userId, userId))
        .returning({ userId: patients.userId });
      if (!deleted) throw new RecordNotFoundException("patients", userId);
      await deleteUserTx(tx, userId);
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createUserWithNurse(
  userData: NewUser,
  nurseData: Omit<NewNurse, "userId">
): Promise<{ user: User; nurse: Nurse }> {
  try {
    return await db.transaction(async (tx) => {
      const user = await insertUser(tx, userData);
      const [nurse] = await tx
        .insert(nurses)
        .values({ ...nurseData, userId: user.id })
        .returning();
      if (!nurse) throw new Error("Failed to create nurse");
      return { user, nurse };
    });
  } catch (err) {
    if (err instanceof Error && !("code" in err)) throw err;
    throw parsePgError(err);
  }
}

export async function deleteUserWithNurse(
  userId: string
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(nurses)
        .where(eq(nurses.userId, userId))
        .returning({ userId: nurses.userId });
      if (!deleted) throw new RecordNotFoundException("nurses", userId);
      await deleteUserTx(tx, userId);
    });
  } catch (err) {
    throw parsePgError(err);
  }
}