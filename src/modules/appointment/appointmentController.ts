import type { ValidatedContext } from "../../utils/validator";
import type {
    AppointmentIdParam,
    CreateAppointmentInput,
    DoctorIdParam,
    PaginationQuery,
    PatientIdParam,
    UpdateAppointmentInput,
} from "./appointmentSchema";
import {
    getAppointment,
    getAppointmentsForPatient,
    getAppointmentsForDoctor,
    createNewAppointment,
    updateExistingAppointment,
    confirmExistingAppointment,
    cancelExistingAppointment,
    completeExistingAppointment
} from "./appointmentService";

export async function getAppointmentHandler(c: ValidatedContext<unknown, AppointmentIdParam>) {
    const { appointmentId } = c.req.valid("param");
    const appointment = await getAppointment(appointmentId);
    return c.json(appointment);
}

export async function getAppointmentsForPatientHandler(c: ValidatedContext<unknown, PatientIdParam>) {
    const { patientId } = c.req.valid("param");
    const appointments = await getAppointmentsForPatient(patientId);
    return c.json(appointments);
}

export async function getAppointmentsForDoctorHandler(c: ValidatedContext<unknown, DoctorIdParam, PaginationQuery>) {
    const { doctorId } = c.req.valid("param");
    const { limit, page } = c.req.valid("query");
    const appointments = await getAppointmentsForDoctor(doctorId, page, limit);
    return c.json(appointments);
}

export async function createAppointmentHandler(c: ValidatedContext<CreateAppointmentInput>) {
    const input = c.req.valid("json");
    const user = c.get("user").sub;
    const appointment = await createNewAppointment(input, user);
    return c.json(appointment, 201);
}

export async function updateAppointmentHandler(c: ValidatedContext<UpdateAppointmentInput, AppointmentIdParam>) {
    const { appointmentId } = c.req.valid("param");
    const input = c.req.valid("json");
    const user = c.get("user").sub;
    const appointment = await updateExistingAppointment(appointmentId, input, user);
    return c.json(appointment);
}

export async function confirmAppointmentHandler(c: ValidatedContext<unknown, AppointmentIdParam>) {
    const { appointmentId } = c.req.valid("param");
    const user = c.get("user").sub;
    const appointment = await confirmExistingAppointment(appointmentId, user);
    return c.json(appointment);
}

export async function cancelAppointmentHandler(c: ValidatedContext<unknown, AppointmentIdParam>) {
    const { appointmentId } = c.req.valid("param");
    const user = c.get("user").sub;
    const appointment = await cancelExistingAppointment(appointmentId, user);
    return c.json(appointment);
}

export async function completeAppointmentHandler(c: ValidatedContext<unknown, AppointmentIdParam>) {
    const { appointmentId } = c.req.valid("param");
    const user = c.get("user").sub;
    const appointment = await completeExistingAppointment(appointmentId, user);
    return c.json(appointment);
}