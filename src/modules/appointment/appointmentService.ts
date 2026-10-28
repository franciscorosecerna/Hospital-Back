import { 
    getAppointmentById, 
    getAppointmentsByPatient, 
    getAppointmentsByDoctor, 
    createAppointment,
    updateAppointment,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    type NewAppointment
} from "./appointmentRepository";

export async function getAppointment(appointmentId: string) {
    return await getAppointmentById(appointmentId);
}

export async function getAppointmentsForPatient(patientId: string) {
    return await getAppointmentsByPatient(patientId);
}

export async function getAppointmentsForDoctor(doctorId: string, limit: number = 50, page: number = 0) {
    const offset = (page - 1) * limit;
    return await getAppointmentsByDoctor(doctorId, limit, offset);
}

export async function createNewAppointment(data: NewAppointment, performedBy?: string) {
    return await createAppointment(data, performedBy);
}

export async function updateExistingAppointment(appointmentId: string, data: Partial<NewAppointment>, performedBy?: string) {
    return await updateAppointment(appointmentId, data, performedBy);
}

export async function confirmExistingAppointment(appointmentId: string, performedBy?: string) {
    return await confirmAppointment(appointmentId, performedBy);
}

export async function cancelExistingAppointment(appointmentId: string, performedBy?: string) {
    return await cancelAppointment(appointmentId, performedBy);
}

export async function completeExistingAppointment(appointmentId: string, performedBy?: string) {
    return await completeAppointment(appointmentId, performedBy);
}