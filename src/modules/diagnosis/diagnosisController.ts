import type { Context } from "hono";
import type { TokenPayload } from "../authorization/authorizationService";
import { 
    createNewDiagnosis,
    fetchDiagnosesByAppointment,
    fetchDiagnosesByPatient,
    fetchDiagnosisById,
    updateDiagnosisService,
    deleteDiagnosisService
} from "./diagnosisService";

type AuthedContext = Context<{ Variables: { user: TokenPayload } }>;

export async function createDiagnosis(c: AuthedContext) {
  const input = c.req.valid("json" as never);
  const user = c.get("user").sub;
  const diagnosis = await createNewDiagnosis(input, user);
  return c.json(diagnosis, 201);
}

export async function getDiagnosisById(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const diagnosis = await fetchDiagnosisById(id);
  return c.json(diagnosis);
}

export async function getDiagnosesByAppointment(c: AuthedContext) {
  const { appointmentId } = c.req.valid("param" as never);
  const diagnoses = await fetchDiagnosesByAppointment(appointmentId);
  return c.json(diagnoses);
}

export async function getDiagnosesByPatient(c: AuthedContext) {
  const { patientId } = c.req.valid("param" as never);
  const { limit, page } = c.req.valid("query" as never);
  const diagnoses = await fetchDiagnosesByPatient(patientId, limit, page);
  return c.json(diagnoses);
}

export async function updateDiagnosis(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const user = c.get("user").sub;
  const diagnosis = await updateDiagnosisService(id, input, user);
  return c.json(diagnosis);
}

export async function deleteDiagnosis(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const user = c.get("user").sub;
  const diagnosis = await deleteDiagnosisService(id, user);
  return c.json(diagnosis);
}