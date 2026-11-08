import type { ValidatedContext } from "../../utils/validator";
import type {
  CreateAllergyInput,
  IdParam,
  PaginationQuery,
  PatientAndSustanciaParam,
  PatientIdParam,
  UpdateAllergyInput,
} from "./allergySchema";
import { create, getById, getByPatient, getByPatientAndSustancia, remove, update } from "./allergyService";

export async function getbyIdHandler(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const allergy = await getById(id);
  return c.json(allergy);
}

export async function getByPatientAndSustanciaHandler(c: ValidatedContext<unknown, PatientAndSustanciaParam>) {
  const { patientId, sustancia } = c.req.valid("param");
  const allergy = await getByPatientAndSustancia(patientId, sustancia);
  return c.json(allergy);
}

export async function createAllergyHandler(c: ValidatedContext<CreateAllergyInput>) {
  const input = c.req.valid("json");
  const user = c.get("user").sub;
  const allergy = await create(input, user);
  return c.json(allergy, 201);
}

export async function updateAllergyHandler(c: ValidatedContext<UpdateAllergyInput, IdParam>) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const user = c.get("user").sub;
  const allergy = await update(id, input, user);
  return c.json(allergy);
}

export async function removeAllergyHandler(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const user = c.get("user").sub;
  await remove(id, user);
  return c.json({ message: "Allergy removed successfully" });
}

export async function getAllergiesByPatientHandler(c: ValidatedContext<unknown, PatientIdParam, PaginationQuery>) {
  const { patientId } = c.req.valid("param");
  const { limit, page } = c.req.valid("query");
  const allergies = await getByPatient(patientId, limit, page);
  return c.json(allergies);
}