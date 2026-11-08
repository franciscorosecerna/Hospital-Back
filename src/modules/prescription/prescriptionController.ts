import type { ValidatedContext } from "../../utils/validator";
import type {
  AnnulPrescriptionInput,
  AppointmentIdParam,
  CreatePrescriptionInput,
  DoctorIdParam,
  IdParam,
  PaginationQuery,
  PatientIdParam,
  PublicVerifyPrescriptionInput,
  SignPrescriptionInput,
  UpdatePrescriptionInput,
} from "./prescriptionSchema";
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
  verifyPrescriptionPublicService,
  verifyPrescriptionSignatureService,
} from "./prescriptionService";

export async function createPrescription(c: ValidatedContext<CreatePrescriptionInput>) {
  const input = c.req.valid("json");
  const prescription = await createPrescriptionService(c.get("user").sub, input);
  return c.json(prescription, 201);
}

export async function getPrescription(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const prescription = await getPrescriptionService(id, c.get("user"));
  return c.json(prescription);
}

export async function getPrescriptionByAppointment(c: ValidatedContext<unknown, AppointmentIdParam>) {
  const { appointmentId } = c.req.valid("param");
  const prescription = await getPrescriptionByAppointmentService(appointmentId, c.get("user"));
  return c.json(prescription);
}

export async function getPrescriptionsByPatient(c: ValidatedContext<unknown, PatientIdParam, PaginationQuery>) {
  const { patientId } = c.req.valid("param");
  const { limit, page } = c.req.valid("query");
  const prescriptions = await getPrescriptionsByPatientService(patientId, c.get("user"), limit, page);
  return c.json(prescriptions);
}

export async function getPrescriptionsByDoctor(c: ValidatedContext<unknown, DoctorIdParam, PaginationQuery>) {
  const { doctorId } = c.req.valid("param");
  const { limit, page } = c.req.valid("query");
  const prescriptions = await getPrescriptionsByDoctorService(doctorId, limit, page);
  return c.json(prescriptions);
}

export async function getPrescriptionHash(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const hashData = await getPrescriptionHashService(id, c.get("user").sub);
  return c.json(hashData);
}

export async function updatePrescription(c: ValidatedContext<UpdatePrescriptionInput, IdParam>) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const prescription = await updatePrescriptionService(id, c.get("user").sub, input);
  return c.json(prescription);
}

export async function deletePrescription(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const deleted = await deletePrescriptionService(id, c.get("user").sub);
  return c.json(deleted);
}

export async function signPrescription(c: ValidatedContext<SignPrescriptionInput, IdParam>) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const prescription = await signPrescriptionService(id, c.get("user").sub, input);
  return c.json(prescription);
}

export async function verifyPrescription(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const ipOrigen = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? c.req.header("x-real-ip");
  const verification = await verifyPrescriptionSignatureService(id, c.get("user"), ipOrigen);
  return c.json(verification);
}

export async function verifyPrescriptionPublic(
  c: ValidatedContext<PublicVerifyPrescriptionInput, IdParam>,
) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const ipOrigen = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? c.req.header("x-real-ip");
  const result = await verifyPrescriptionPublicService(id, input, ipOrigen);
  return c.json(result);
}

export async function annulPrescription(c: ValidatedContext<AnnulPrescriptionInput, IdParam>) {
  const { id } = c.req.valid("param");
  const { motivoAnulacion } = c.req.valid("json");
  const prescription = await annulPrescriptionService(id, c.get("user").sub, motivoAnulacion);
  return c.json(prescription);
}