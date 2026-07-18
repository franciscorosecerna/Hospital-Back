import type { Context } from "hono";
import {
  registerDoctor,
  findDoctorByUserId,
  findDoctorByMatricula,
  listDoctors,
  editDoctor,
  removeDoctor,
} from "./doctorService";
import type { TokenPayload } from "../../authorization/authorizationService";

type AuthedContext = Context<{ Variables: { user: TokenPayload } }>;

export async function createDoctor(c: AuthedContext) {
  const input = c.req.valid("json" as never);
  const performedBy = c.get("user").sub;
  const result = await registerDoctor(input, performedBy);
  return c.json(result, 201);
}

export async function getDoctors(c: Context) {
  const limit = Number(c.req.query("limit") ?? 50);
  const page = Number(c.req.query("page") ?? 1);
  const doctors = await listDoctors(limit, page);
  return c.json(doctors);
}

export async function getDoctorByMatricula(c: Context) {
  const { matricula } = c.req.valid("param" as never);
  const doctor = await findDoctorByMatricula(matricula);
  return c.json(doctor);
}

export async function getDoctorById(c: Context) {
  const { id } = c.req.valid("param" as never);
  const result = await findDoctorByUserId(id);
  return c.json(result);
}

export async function updateDoctor(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const performedBy = c.get("user").sub;
  const doctor = await editDoctor(id, input, performedBy);
  return c.json(doctor);
}

export async function deleteDoctor(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const performedBy = c.get("user").sub;
  await removeDoctor(id, performedBy);
  return c.json({ message: "Doctor eliminado correctamente." });
}