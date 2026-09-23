import { 
  getProcedureById,
  getProceduresByPatient,
  getProceduresByDoctor,
  getProceduresByAppointment,
  type Procedure,
  createProcedure,
  type NewProcedure,
  updateProcedure,
  deleteProcedure
} from "./procedureRepository";

export async function getProcedureByIdService(id: string): Promise<Procedure> {
  return await getProcedureById(id);
}

export async function getProceduresByPatientService(
    patientId: string,
    limit: number,
    page: number
): Promise<Procedure[]> {
  const offset = (page - 1) * limit;
  return await getProceduresByPatient(patientId, limit, offset);
}

export async function getProceduresByDoctorService(
    doctorId: string,
    limit: number,
    page: number
): Promise<Procedure[]> {
  const offset = (page - 1) * limit;
  return await getProceduresByDoctor(doctorId, limit, offset);
}

export async function getProceduresByAppointmentService(
    appointmentId: string
): Promise<Procedure[]> {
  return await getProceduresByAppointment(appointmentId);
}

export async function createProcedureService(
    data: NewProcedure,
    performedBy?: string
): Promise<Procedure> {
  return await createProcedure(data, performedBy);
}

export async function updateProcedureService(
    id: string,
    data: Partial<NewProcedure>,
    performedBy?: string
): Promise<Procedure> {
  return await updateProcedure(id, data, performedBy);
}

export async function deleteProcedureService(
    id: string,
    performedBy?: string
): Promise<Procedure> {
  return await deleteProcedure(id, performedBy);
}