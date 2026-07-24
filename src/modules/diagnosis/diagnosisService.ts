import { createDiagnosis, deleteDiagnosis, getDiagnosesByAppointment, getDiagnosesByPatient, getDiagnosisById, updateDiagnosis, type NewDiagnosis } from "./diagnosisRepository";

export async function fetchDiagnosisById(id: string) {
    return await getDiagnosisById(id);
}

export async function fetchDiagnosesByPatient(patientId: string, limit: number, page: number) {
    const offset = (page - 1) * limit;
    return await getDiagnosesByPatient(patientId, limit, offset);
}

export async function fetchDiagnosesByAppointment(appointmentId: string) {
    return await getDiagnosesByAppointment(appointmentId);
}

export async function createNewDiagnosis(data: NewDiagnosis, performedBy?: string) {
    return await createDiagnosis(data, performedBy);
}

export async function updateDiagnosisService(id: string, data: Partial<NewDiagnosis>, performedBy?: string) {
    return await updateDiagnosis(id, data, performedBy);
}

export async function deleteDiagnosisService(id: string, performedBy?: string) {
    return await deleteDiagnosis(id, performedBy);
}