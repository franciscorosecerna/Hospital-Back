import type { ValidatedContext } from "../../../utils/validator";
import type {
  CreateDoctorInput,
  IdParam,
  MatriculaParam,
  PaginationQuery,
  UpdateDoctorInput,
} from "../userSchema";
import {
  registerDoctor,
  findDoctorByUserId,
  findDoctorByMatricula,
  listDoctors,
  editDoctor,
  removeDoctor,
} from "./doctorService";

export async function createDoctor(c: ValidatedContext<CreateDoctorInput>) {
  const input = c.req.valid("json");
  const performedBy = c.get("user").sub;
  const result = await registerDoctor(input, performedBy);
  return c.json(result, 201);
}

export async function getDoctors(c: ValidatedContext<unknown, unknown, PaginationQuery>) {
  const { limit, page } = c.req.valid("query");
  const doctors = await listDoctors(limit, page);
  return c.json(doctors);
}

export async function getDoctorByMatricula(c: ValidatedContext<unknown, MatriculaParam>) {
  const { matricula } = c.req.valid("param");
  const doctor = await findDoctorByMatricula(matricula);
  return c.json(doctor);
}

export async function getDoctorById(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const result = await findDoctorByUserId(id);
  return c.json(result);
}

export async function updateDoctor(c: ValidatedContext<UpdateDoctorInput, IdParam>) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const performedBy = c.get("user").sub;
  const doctor = await editDoctor(id, input, performedBy);
  return c.json(doctor);
}

export async function deleteDoctor(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const performedBy = c.get("user").sub;
  await removeDoctor(id, performedBy);
  return c.json({ message: "Doctor eliminado correctamente." });
}