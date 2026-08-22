import type { Context } from "hono";
import type { TokenPayload } from "../authorization/authorizationService";
import { create, getById, getByPatient, getByPatientAndSustancia, remove, update } from "./allergyService";

type AuthedContext = Context<{ Variables: { user: TokenPayload } }>;

export async function getbyIdHandler(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const allergy = await getById(id);
  return c.json(allergy);
}

export async function getByPatientAndSustanciaHandler(c: AuthedContext) {
  const { patientId, sustancia } = c.req.valid("param" as never);
  const allergy = await getByPatientAndSustancia(patientId, sustancia);
  return c.json(allergy);
}

export async function createAllergyHandler(c: AuthedContext) {
  const input = c.req.valid("json" as never);
  const user = c.get("user").sub;
  const allergy = await create(input, user);
  return c.json(allergy, 201);
}

export async function updateAllergyHandler(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const input = c.req.valid("json" as never);
  const user = c.get("user").sub;
  const allergy = await update(id, input, user);
  return c.json(allergy);
}

export async function removeAllergyHandler(c: AuthedContext) {
  const { id } = c.req.valid("param" as never);
  const user = c.get("user").sub;
  await remove(id, user);
  return c.json({ message: "Allergy removed successfully" });
}

export async function getAllergiesByPatientHandler(c: AuthedContext) {
  const { patientId } = c.req.valid("param" as never);
  const { limit, page } = c.req.valid("query" as never);
  const allergies = await getByPatient(patientId, limit, page);
  return c.json(allergies);
}