import
{
  finalizeAssignment,
  getDoctorPatientById,
  getActiveAssignmentsByPatient,
  getActiveAssignmentsByDoctor,
  assignDoctorToPatient,
  type DoctorPatient
} from "./doctorPatientRepository";

export async function getDoctorPatientAssignmentById(id: string): Promise<DoctorPatient> {
  return getDoctorPatientById(id);
}

export async function getActiveAssignmentsForPatient(patientId: string): Promise<DoctorPatient[]> {
  return getActiveAssignmentsByPatient(patientId);
}

export async function getActiveAssignmentsForDoctor(doctorId: string, page: number = 0, limit: number = 50): Promise<DoctorPatient[]> {
  const offset = (page - 1) * limit;
  return getActiveAssignmentsByDoctor(doctorId, limit, offset);
}

export async function createDoctorPatientAssignment(
  data: Omit<DoctorPatient, "id" | "fechaFinalizacion">,
  performedBy?: string
): Promise<DoctorPatient> {
  return assignDoctorToPatient(data, performedBy);
}

export async function finalizeDoctorPatientAssignment(
  id: string,
  fechaFinalizacion: string,
  performedBy?: string
): Promise<DoctorPatient> {
  return finalizeAssignment(id, fechaFinalizacion, performedBy);
}