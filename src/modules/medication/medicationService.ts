import {
  createMedication,
  deleteMedication,
  getMedicationById,
  listMedications,
  updateMedication,
} from "./medicationRepository";
import type { CreateMedicationInput, UpdateMedicationInput } from "./medicationSchema";

export async function listMedicationsService(limit: number = 20, page: number = 1, search?: string) {
  const offset = (page - 1) * limit;
  return listMedications(limit, offset, search);
}

export async function getMedicationService(id: string) {
  return getMedicationById(id);
}

export async function createMedicationService(data: CreateMedicationInput, performedBy: string) {
  return createMedication(data, performedBy);
}

export async function updateMedicationService(id: string, data: UpdateMedicationInput, performedBy: string) {
  return updateMedication(id, data, performedBy);
}

export async function deleteMedicationService(id: string, performedBy: string) {
  return deleteMedication(id, performedBy);
}