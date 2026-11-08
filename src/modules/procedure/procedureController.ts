import type { ValidatedContext } from "../../utils/validator";
import type {
  AppointmentIdParam,
  CreateProcedureInput,
  DoctorIdParam,
  IdParam,
  PaginationQuery,
  PatientIdParam,
  UpdateProcedureInput,
} from "./procedureSchema";
import {
  createProcedureService,
  getProcedureByIdService,
  getProceduresByPatientService,
  getProceduresByDoctorService,
  getProceduresByAppointmentService,
  updateProcedureService,
  deleteProcedureService,
} from "./procedureService";

export async function getProcedureById(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const procedure = await getProcedureByIdService(id);
  return c.json(procedure);
}

export async function getProceduresByPatient(c: ValidatedContext<unknown, PatientIdParam, PaginationQuery>) {
  const { patientId } = c.req.valid("param");
  const { limit, page } = c.req.valid("query");
  const procedures = await getProceduresByPatientService(patientId, limit, page);
  return c.json(procedures);
}

export async function getProceduresByDoctor(c: ValidatedContext<unknown, DoctorIdParam, PaginationQuery>) {
  const { doctorId } = c.req.valid("param");
  const { limit, page } = c.req.valid("query");
  const procedures = await getProceduresByDoctorService(doctorId, limit, page);
  return c.json(procedures);
}

export async function getProceduresByAppointment(c: ValidatedContext<unknown, AppointmentIdParam>) {
  const { appointmentId } = c.req.valid("param");
  const procedures = await getProceduresByAppointmentService(appointmentId);
  return c.json(procedures);
}

export async function createProcedure(c: ValidatedContext<CreateProcedureInput>) {
  const input = c.req.valid("json");
  const user = c.get("user").sub;
  const procedure = await createProcedureService(input, user);
  return c.json(procedure, 201);
}

export async function updateProcedure(c: ValidatedContext<UpdateProcedureInput, IdParam>) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const user = c.get("user").sub;
  const procedure = await updateProcedureService(id, input, user);
  return c.json(procedure);
}

export async function deleteProcedure(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const user = c.get("user").sub;
  const procedure = await deleteProcedureService(id, user);
  return c.json(procedure);
}