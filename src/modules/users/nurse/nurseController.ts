import type { ValidatedContext } from "../../../utils/validator";
import type {
  CreateNurseInput,
  DepartmentIdParam,
  IdParam,
  PaginationQuery,
  TurnoParam,
  UpdateNurseInput,
} from "../userSchema";
import {
  registerNurse,
  findNurseByUserId,
  listNursesByDepartment,
  listNursesByTurno,
  listNurses,
  editNurse,
  removeNurse,
} from "./nurseService";

export async function createNurse(c: ValidatedContext<CreateNurseInput>) {
  const input = c.req.valid("json");
  const performedBy = c.get("user").sub;
  const result = await registerNurse(input, performedBy);
  return c.json(result, 201);
}

export async function getNurses(c: ValidatedContext<unknown, unknown, PaginationQuery>) {
  const { limit, page } = c.req.valid("query");
  const nurses = await listNurses(limit, page);
  return c.json(nurses);
}

export async function getNursesByDepartment(c: ValidatedContext<unknown, DepartmentIdParam, PaginationQuery>) {
  const { departmentId } = c.req.valid("param");
  const { limit, page } = c.req.valid("query");
  const nurses = await listNursesByDepartment(departmentId, limit, page);
  return c.json(nurses);
}

export async function getNursesByTurno(c: ValidatedContext<unknown, TurnoParam, PaginationQuery>) {
  const { turno } = c.req.valid("param");
  const { limit, page } = c.req.valid("query");
  const nurses = await listNursesByTurno(turno, limit, page);
  return c.json(nurses);
}

export async function getNurseById(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const result = await findNurseByUserId(id);
  return c.json(result);
}

export async function updateNurse(c: ValidatedContext<UpdateNurseInput, IdParam>) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const performedBy = c.get("user").sub;
  const nurse = await editNurse(id, input, performedBy);
  return c.json(nurse);
}

export async function deleteNurse(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const performedBy = c.get("user").sub;
  await removeNurse(id, performedBy);
  return c.json({ message: "Enfermero/a eliminado/a correctamente." });
}