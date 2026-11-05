import { type Context } from "hono";
import type { TokenPayload } from "../authorization/authorizationService";
import {
  annulPrescriptionService,
  createPrescriptionService,
  deletePrescriptionService,
  getPrescriptionByAppointmentService,
  getPrescriptionHashService,
  getPrescriptionService,
  getPrescriptionsByDoctorService,
  getPrescriptionsByPatientService,
  signPrescriptionService,
  updatePrescriptionService,
  verifyPrescriptionSignatureService,
} from "./prescriptionService";

type AuthedContext = Context<{ Variables: { user: TokenPayload } }>;

export async function createPrescription(c: AuthedContext) {
  const input = c.req.valid("json" as never);
  const prescription = await createPrescriptionService(c.get("user").sub, input);
  return c.json(prescription, 201);
}

export async function getPrescription(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const prescription = await getPrescriptionService(id);
  return c.json(prescription);
}

export async function getPrescriptionByAppointment(c: AuthedContext) {
  const { appointmentId } = c.req.valid("param" as never);
  const prescription = await getPrescriptionByAppointmentService(appointmentId);
  return c.json(prescription);
}

export async function getPrescriptionsByPatient(c: AuthedContext) {
  const { patientId } = c.req.valid("param" as never);
  const { limit, page } = c.req.valid("query" as never);
  const prescriptions = await getPrescriptionsByPatientService(patientId, limit, page);
  return c.json(prescriptions);
}

export async function getPrescriptionsByDoctor(c: AuthedContext) {
  const { doctorId } = c.req.valid("param" as never);
  const { limit, page } = c.req.valid("query" as never);
  const prescriptions = await getPrescriptionsByDoctorService(doctorId, limit, page);
  return c.json(prescriptions);
}

export async function getPrescriptionHash(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const hashData = await getPrescriptionHashService(id, c.get("user").sub);
  return c.json(hashData);
}

export async function updatePrescription(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const prescription = await updatePrescriptionService(id, c.get("user").sub, input);
  return c.json(prescription);
}

export async function deletePrescription(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const deleted = await deletePrescriptionService(id, c.get("user").sub);
  return c.json(deleted);
}

export async function signPrescription(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const prescription = await signPrescriptionService(id, c.get("user").sub, input);
  return c.json(prescription);
}

export async function verifyPrescription(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const ipOrigen = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? c.req.header("x-real-ip");
  const verification = await verifyPrescriptionSignatureService(id, c.get("user").sub, ipOrigen);
  return c.json(verification);
}

export async function annulPrescription(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const { motivoAnulacion } = c.req.valid("json" as never);
  const prescription = await annulPrescriptionService(id, c.get("user").sub, motivoAnulacion);
  return c.json(prescription);
}
