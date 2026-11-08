import type { ValidatedContext } from "../../utils/validator";
import type {
  AppointmentIdParam,
  CreateDiagnosisInput,
  IdParam,
  PaginationQuery,
  PatientIdParam,
  UpdateDiagnosisInput,
} from "./diagnosisSchema";
import {
  createNewDiagnosis,
  fetchDiagnosesByAppointment,
  fetchDiagnosesByPatient,
  fetchDiagnosisById,
  updateDiagnosisService,
  deleteDiagnosisService,
} from "./diagnosisService";

export async function createDiagnosis(c: ValidatedContext<CreateDiagnosisInput>) {
  const input = c.req.valid("json");
  const user = c.get("user").sub;
  const diagnosis = await createNewDiagnosis(input, user);
  return c.json(diagnosis, 201);
}

export async function getDiagnosisById(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const diagnosis = await fetchDiagnosisById(id);
  return c.json(diagnosis);
}

export async function getDiagnosesByAppointment(c: ValidatedContext<unknown, AppointmentIdParam>) {
  const { appointmentId } = c.req.valid("param");
  const diagnoses = await fetchDiagnosesByAppointment(appointmentId);
  return c.json(diagnoses);
}

export async function getDiagnosesByPatient(c: ValidatedContext<unknown, PatientIdParam, PaginationQuery>) {
  const { patientId } = c.req.valid("param");
  const { limit, page } = c.req.valid("query");
  const diagnoses = await fetchDiagnosesByPatient(patientId, limit, page);
  return c.json(diagnoses);
}

export async function updateDiagnosis(c: ValidatedContext<UpdateDiagnosisInput, IdParam>) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const user = c.get("user").sub;
  const diagnosis = await updateDiagnosisService(id, input, user);
  return c.json(diagnosis);
}

export async function deleteDiagnosis(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const user = c.get("user").sub;
  const diagnosis = await deleteDiagnosisService(id, user);
  return c.json(diagnosis);
}