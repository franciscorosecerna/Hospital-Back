import type { ValidatedContext } from "../../../utils/validator";
import type {
  CreatePatientInput,
  HistoriaClinicaParam,
  IdParam,
  PaginationQuery,
  UpdatePatientInput,
} from "../userSchema";
import {
  registerPatient,
  findPatientByUserId,
  findPatientByHistoriaClinica,
  listPatients,
  editPatient,
  removePatient,
} from "./patientService";

export async function createPatient(c: ValidatedContext<CreatePatientInput>) {
  const input = c.req.valid("json");
  const performedBy = c.get("user").sub;
  const result = await registerPatient(input, performedBy);
  return c.json(result, 201);
}

export async function getPatients(c: ValidatedContext<unknown, unknown, PaginationQuery>) {
  const { limit, page } = c.req.valid("query");
  const patients = await listPatients(limit, page);
  return c.json(patients);
}

export async function getPatientByHistoriaClinica(c: ValidatedContext<unknown, HistoriaClinicaParam>) {
  const { numeroHistoriaClinica } = c.req.valid("param");
  const patient = await findPatientByHistoriaClinica(numeroHistoriaClinica);
  return c.json(patient);
}

export async function getPatientById(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const result = await findPatientByUserId(id);
  return c.json(result);
}

export async function updatePatient(c: ValidatedContext<UpdatePatientInput, IdParam>) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const performedBy = c.get("user").sub;
  const patient = await editPatient(id, input, performedBy);
  return c.json(patient);
}

export async function deletePatient(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const performedBy = c.get("user").sub;
  await removePatient(id, performedBy);
  return c.json({ message: "Paciente eliminado correctamente." });
}