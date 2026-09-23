import type { Context } from "hono";
import type { TokenPayload } from "../authorization/authorizationService";
import {
  createProcedureService,
  getProcedureByIdService,
  getProceduresByPatientService,
  getProceduresByDoctorService,
  getProceduresByAppointmentService,
  updateProcedureService,
  deleteProcedureService
} from "./procedureService";

type AuthedContext = Context<{ Variables: { user: TokenPayload } }>;

export async function getProcedureById(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const procedure = await getProcedureByIdService(id);
  return c.json(procedure);
}

export async function getProceduresByPatient(c: AuthedContext) {
  const { patientId } = c.req.valid("param" as never);
  const { limit, page } = c.req.valid("query" as never);
  const procedures = await getProceduresByPatientService(patientId, limit, page);
  return c.json(procedures);
}

export async function getProceduresByDoctor(c: AuthedContext) {
  const { doctorId } = c.req.valid("param" as never);
  const { limit, page } = c.req.valid("query" as never);
  const procedures = await getProceduresByDoctorService(doctorId, limit, page);
  return c.json(procedures);
}

export async function getProceduresByAppointment(c: AuthedContext) {
  const { appointmentId } = c.req.valid("param" as never);
  const procedures = await getProceduresByAppointmentService(appointmentId);
  return c.json(procedures);
}

export async function createProcedure(c: AuthedContext) {
  const input = c.req.valid("json" as never);
  const user = c.get("user").sub;
  const procedure = await createProcedureService(input, user);
  return c.json(procedure, 201);
}

export async function updateProcedure(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const user = c.get("user").sub;
  const procedure = await updateProcedureService(id, input, user);
  return c.json(procedure);
}

export async function deleteProcedure(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const user = c.get("user").sub;
  const procedure = await deleteProcedureService(id, user);
  return c.json(procedure);
}