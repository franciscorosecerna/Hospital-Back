import type { ValidatedContext } from "../../utils/validator";
import type {
  CreateMedicationInput,
  IdParam,
  MedicationSearchQuery,
  UpdateMedicationInput,
} from "./medicationSchema";
import {
  createMedicationService,
  deleteMedicationService,
  getMedicationService,
  listMedicationsService,
  updateMedicationService,
} from "./medicationService";

export async function listMedications(c: ValidatedContext<unknown, unknown, MedicationSearchQuery>) {
  const { limit, page, search } = c.req.valid("query");
  const items = await listMedicationsService(limit, page, search);
  return c.json(items);
}

export async function getMedication(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const medication = await getMedicationService(id);
  return c.json(medication);
}

export async function createMedication(c: ValidatedContext<CreateMedicationInput>) {
  const input = c.req.valid("json");
  const created = await createMedicationService(input, c.get("user").sub);
  return c.json(created, 201);
}

export async function updateMedication(c: ValidatedContext<UpdateMedicationInput, IdParam>) {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const updated = await updateMedicationService(id, input, c.get("user").sub);
  return c.json(updated);
}

export async function deleteMedication(c: ValidatedContext<unknown, IdParam>) {
  const { id } = c.req.valid("param");
  const deleted = await deleteMedicationService(id, c.get("user").sub);
  return c.json(deleted);
}