import { type Context } from "hono";
import type { TokenPayload } from "../authorization/authorizationService";
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

type AuthedContext = Context<{ Variables: { user: TokenPayload } }>;

export async function getAppointmentHandler(c: AuthedContext) {
    const { appointmentId } = c.req.valid("param" as never);
    const appointment = await getAppointment(appointmentId);
    return c.json(appointment);
}

export async function getAppointmentsForPatientHandler(c: AuthedContext) {
    const { patientId } = c.req.valid("param" as never);
    const appointments = await getAppointmentsForPatient(patientId);
    return c.json(appointments);
}

export async function getAppointmentsForDoctorHandler(c: AuthedContext) {
    const { doctorId } = c.req.valid("param" as never);
    const { limit, page } = c.req.valid("query" as never);
    const appointments = await getAppointmentsForDoctor(doctorId, page, limit);
    return c.json(appointments);
}

export async function createAppointmentHandler(c: AuthedContext) {
    const input = c.req.valid("json" as never);
    const user = c.get("user").sub;
    const appointment = await createNewAppointment(input, user);
    return c.json(appointment, 201);
}

export async function updateAppointmentHandler(c: AuthedContext) {
    const { appointmentId } = c.req.valid("param" as never);
    const input = c.req.valid("json" as never);
    const user = c.get("user").sub;
    const appointment = await updateExistingAppointment(appointmentId, input, user);
    return c.json(appointment);
}

export async function confirmAppointmentHandler(c: AuthedContext) {
    const { appointmentId } = c.req.valid("param" as never);
    const user = c.get("user").sub;
    const appointment = await confirmExistingAppointment(appointmentId, user);
    return c.json(appointment);
}

export async function cancelAppointmentHandler(c: AuthedContext) {
    const { appointmentId } = c.req.valid("param" as never);
    const user = c.get("user").sub;
    const appointment = await cancelExistingAppointment(appointmentId, user);
    return c.json(appointment);
}

export async function completeAppointmentHandler(c: AuthedContext) {
    const { appointmentId } = c.req.valid("param" as never);
    const user = c.get("user").sub;
    const appointment = await completeExistingAppointment(appointmentId, user);
    return c.json(appointment);
}