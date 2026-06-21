import type { Context } from "hono";
import {
  registerDoctor,
  findDoctorByUserId,
  findDoctorByMatricula,
  listDoctors,
  editDoctor,
  removeDoctor,
} from "./doctorService";

export async function createDoctor(c: Context) {
  const input = c.req.valid("json" as never);
  const result = await registerDoctor(input);
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

export async function updateDoctor(c: Context) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const doctor = await editDoctor(id, input);
  return c.json(doctor);
}

export async function deleteDoctor(c: Context) {
  const { id } = c.req.valid("param" as never);
  await removeDoctor(id);
  return c.json({ message: "Doctor eliminado correctamente." });
}