import { 
  getAllergiesByPatient,
  getAllergyById,
  getAllergyByPatientAndSustancia,
  createAllergy,
  updateAllergy,
  deleteAllergy,
  type Allergy 
} from "./allergyRepository";

export async function getById(id: string): Promise<Allergy> {
  return await getAllergyById(id);
}

export async function getByPatientAndSustancia(
  patientId: string,
  sustancia: string
): Promise<Allergy> {
  return await getAllergyByPatientAndSustancia(patientId, sustancia);
}

export async function getByPatient(patientId: string, limit: number, page: number): Promise<Allergy[]> {
  const offset = (page - 1) * limit;
  return await getAllergiesByPatient(patientId, limit, offset);
}

export async function create(data: Allergy, performedBy?: string): Promise<Allergy> {
  return await createAllergy(data, performedBy);
}

export async function update(id: string, data: Partial<Allergy>, performedBy?: string): Promise<Allergy> {
  return await updateAllergy(id, data, performedBy);
}

export async function remove(id: string, performedBy?: string): Promise<Allergy> {
  return await deleteAllergy(id, performedBy);
}