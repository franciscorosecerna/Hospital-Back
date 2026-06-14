import type { Context } from "hono";
import {
  registerPatient,
  findPatientByUserId,
  findPatientByHistoriaClinica,
  listPatients,
  editPatient,
  removePatient,
} from "./patientService";

export async function createPatient(c: Context) {
  const input = c.req.valid("json" as never);
  const result = await registerPatient(input);
  return c.json(result, 201);
}

export async function getPatients(c: Context) {
  const limit = Number(c.req.query("limit") ?? 50);
  const page = Number(c.req.query("page") ?? 0);
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

export async function updatePatient(c: Context) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const patient = await editPatient(id, input);
  return c.json(patient);
}

export async function deletePatient(c: Context) {
  const { id } = c.req.valid("param" as never);
  await removePatient(id);
  return c.json({ message: "Paciente eliminado correctamente." });
}