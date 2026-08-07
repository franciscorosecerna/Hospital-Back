import type { Context } from "hono";
import {
  registerPatient,
  findPatientByUserId,
  findPatientByHistoriaClinica,
  listPatients,
  editPatient,
  removePatient,
} from "./patientService";
import type { TokenPayload } from "../../authorization/authorizationService";

type AuthedContext = Context<{ Variables: { user: TokenPayload } }>;

export async function createPatient(c: AuthedContext) {
  const input = c.req.valid("json" as never);
  const performedBy = c.get("user").sub;
  const result = await registerPatient(input, performedBy);
  return c.json(result, 201);
}

export async function getPatients(c: Context) {
  const { limit, page } = c.req.valid("query" as never);
  const patients = await listPatients(limit, page);
  return c.json(patients);
}

export async function getPatientByHistoriaClinica(c: Context) {
  const { numeroHistoriaClinica } = c.req.valid("param" as never);
  const patient = await findPatientByHistoriaClinica(numeroHistoriaClinica);
  return c.json(patient);
}

export async function getPatientById(c: Context) {
  const { id } = c.req.valid("param" as never);
  const result = await findPatientByUserId(id);
  return c.json(result);
}

export async function updatePatient(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const performedBy = c.get("user").sub;
  const patient = await editPatient(id, input, performedBy);
  return c.json(patient);
}

export async function deletePatient(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const performedBy = c.get("user").sub;
  await removePatient(id, performedBy);
  return c.json({ message: "Paciente eliminado correctamente." });
}