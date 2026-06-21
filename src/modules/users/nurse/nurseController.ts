import type { Context } from "hono";
import {
  registerNurse,
  findNurseByUserId,
  listNursesByDepartment,
  listNursesByTurno,
  listNurses,
  editNurse,
  removeNurse,
} from "./nurseService";

export async function createNurse(c: Context) {
  const input = c.req.valid("json" as never);
  const result = await registerNurse(input);
  return c.json(result, 201);
}

export async function getNurses(c: Context) {
  const limit = Number(c.req.query("limit") ?? 50);
  const page = Number(c.req.query("page") ?? 1);
  const nurses = await listNurses(limit, page);
  return c.json(nurses);
}

export async function getNursesByDepartment(c: Context) {
  const { departmentId } = c.req.valid("param" as never);
  const nurses = await listNursesByDepartment(departmentId);
  return c.json(nurses);
}

export async function getNursesByTurno(c: Context) {
  const { turno } = c.req.valid("param" as never);
  const nurses = await listNursesByTurno(turno);
  return c.json(nurses);
}

export async function getNurseById(c: Context) {
  const { id } = c.req.valid("param" as never);
  const result = await findNurseByUserId(id);
  return c.json(result);
}

export async function updateNurse(c: Context) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const nurse = await editNurse(id, input);
  return c.json(nurse);
}

export async function deleteNurse(c: Context) {
  const { id } = c.req.valid("param" as never);
  await removeNurse(id);
  return c.json({ message: "Enfermero/a eliminado/a correctamente." });
}