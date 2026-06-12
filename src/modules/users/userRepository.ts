import { eq, and, isNull } from "drizzle-orm";
import { db } from "../../db/client";
import { users, doctors, patients, nurses } from "../../db/schema/users";
import { parsePgError, RecordNotFoundException } from "../../utils/exceptions";
import { withTimestamp, softDeletePayload} from "../../utils/softDelete";

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type NewDoctor = typeof doctors.$inferInsert;
export type Doctor = typeof doctors.$inferSelect;

export type NewPatient = typeof patients.$inferInsert;
export type Patient = typeof patients.$inferSelect;

export type NewNurse = typeof nurses.$inferInsert;
export type Nurse = typeof nurses.$inferSelect;

const notDeleted = isNull(users.deletedAt);

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
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), notDeleted));
    if (!user) throw new RecordNotFoundException("users", id);
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
          eq(users.documento, documento),
          notDeleted
        )
      );
    if (!user)
      throw new RecordNotFoundException("users", `${tipoDocumento}:${documento}`);
    return user;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllUsers(
  limit: number = 50,
  offset: number = 0
): Promise<User[]> {
  try {
    return await db
      .select()
      .from(users)
      .where(notDeleted)
      .limit(limit)
      .offset(offset);
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
      .set(withTimestamp(data))
      .where(and(eq(users.id, id), notDeleted))
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
      .set(withTimestamp({ password: hashedPassword }))
      .where(and(eq(users.id, id), notDeleted))
      .returning({ id: users.id });
    if (!updated) throw new RecordNotFoundException("users", id);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function deleteUser(id: string): Promise<User> {
  try {
    const [deleted] = await db
      .update(users)
      .set(softDeletePayload())
      .where(and(eq(users.id, id), notDeleted))
      .returning();
    if (!deleted) throw new RecordNotFoundException("users", id);
    return deleted;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getDoctorByUserId(userId: string): Promise<Doctor> {
  try {
    const [doctor] = await db
      .select()
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(and(eq(doctors.userId, userId), notDeleted))
      .then((rows) => rows.map((r) => r.doctors));
    if (!doctor) throw new RecordNotFoundException("doctors", userId);
    return doctor;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getDoctorByMatricula(matricula: string): Promise<Doctor> {
  try {
    const [doctor] = await db
      .select({ doctors })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(and(eq(doctors.matricula, matricula), notDeleted))
      .then((rows) => rows.map((r) => r.doctors));
    if (!doctor) throw new RecordNotFoundException("doctors", matricula);
    return doctor;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllDoctors(
  limit: number = 50,
  offset: number = 0
): Promise<Doctor[]> {
  try {
    return await db
      .select({ doctors })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(notDeleted)
      .limit(limit)
      .offset(offset)
      .then((rows) => rows.map((r) => r.doctors));
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
      .set(withTimestamp(data))
      .where(eq(doctors.userId, userId))
      .returning();
    if (!updated) throw new RecordNotFoundException("doctors", userId);
    return updated;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getPatientByUserId(userId: string): Promise<Patient> {
  try {
    const [patient] = await db
      .select({ patients })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(and(eq(patients.userId, userId), notDeleted))
      .then((rows) => rows.map((r) => r.patients));
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
      .select({ patients })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(
        and(eq(patients.numeroHistoriaClinica, numeroHistoriaClinica), notDeleted)
      )
      .then((rows) => rows.map((r) => r.patients));
    if (!patient)
      throw new RecordNotFoundException("patients", numeroHistoriaClinica);
    return patient;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllPatients(
  limit: number = 50,
  offset: number = 0
): Promise<Patient[]> {
  try {
    return await db
      .select({ patients })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(notDeleted)
      .limit(limit)
      .offset(offset)
      .then((rows) => rows.map((r) => r.patients));
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
      .set(withTimestamp(data))
      .where(eq(patients.userId, userId))
      .returning();
    if (!updated) throw new RecordNotFoundException("patients", userId);
    return updated;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getNurseByUserId(userId: string): Promise<Nurse> {
  try {
    const [nurse] = await db
      .select({ nurses })
      .from(nurses)
      .innerJoin(users, eq(nurses.userId, users.id))
      .where(and(eq(nurses.userId, userId), notDeleted))
      .then((rows) => rows.map((r) => r.nurses));
    if (!nurse) throw new RecordNotFoundException("nurses", userId);
    return nurse;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getNursesByDepartment(departmentId: string): Promise<Nurse[]> {
  try {
    return await db
      .select({ nurses })
      .from(nurses)
      .innerJoin(users, eq(nurses.userId, users.id))
      .where(and(eq(nurses.departmentId, departmentId), notDeleted))
      .then((rows) => rows.map((r) => r.nurses));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getNursesByTurno(turno: string): Promise<Nurse[]> {
  try {
    return await db
      .select({ nurses })
      .from(nurses)
      .innerJoin(users, eq(nurses.userId, users.id))
      .where(and(eq(nurses.turno, turno), notDeleted))
      .then((rows) => rows.map((r) => r.nurses));
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getAllNurses(
  limit: number = 50,
  offset: number = 0
): Promise<Nurse[]> {
  try {
    return await db
      .select({ nurses })
      .from(nurses)
      .innerJoin(users, eq(nurses.userId, users.id))
      .where(notDeleted)
      .limit(limit)
      .offset(offset)
      .then((rows) => rows.map((r) => r.nurses));
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
      .set(withTimestamp(data))
      .where(eq(nurses.userId, userId))
      .returning();
    if (!updated) throw new RecordNotFoundException("nurses", userId);
    return updated;
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

async function softDeleteUserTx(tx: Tx, id: string): Promise<void> {
  const [updated] = await tx
    .update(users)
    .set(softDeletePayload())
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning({ id: users.id });
  if (!updated) throw new RecordNotFoundException("users", id);
}

export async function createDoctor(
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
    throw parsePgError(err);
  }
}

export async function deleteDoctor(userId: string): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const [doctor] = await tx
        .select({ userId: doctors.userId })
        .from(doctors)
        .where(eq(doctors.userId, userId));
      if (!doctor) throw new RecordNotFoundException("doctors", userId);
      await softDeleteUserTx(tx, userId);
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createPatient(
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
    throw parsePgError(err);
  }
}

export async function deletePatient(userId: string): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const [patient] = await tx
        .select({ userId: patients.userId })
        .from(patients)
        .where(eq(patients.userId, userId));
      if (!patient) throw new RecordNotFoundException("patients", userId);
      await softDeleteUserTx(tx, userId);
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createNurse(
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
    throw parsePgError(err);
  }
}

export async function deleteNurse(userId: string): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const [nurse] = await tx
        .select({ userId: nurses.userId })
        .from(nurses)
        .where(eq(nurses.userId, userId));
      if (!nurse) throw new RecordNotFoundException("nurses", userId);
      await softDeleteUserTx(tx, userId);
    });
  } catch (err) {
    throw parsePgError(err);
  }
}