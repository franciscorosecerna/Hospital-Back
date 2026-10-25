import type { Context } from "hono";
import type { TokenPayload } from "../authorization/authorizationService";
import { getDoctorPatientAssignmentById, getActiveAssignmentsForPatient, getActiveAssignmentsForDoctor, createDoctorPatientAssignment, finalizeDoctorPatientAssignment } from "./doctorPatientService";

type AuthedContext = Context<{ Variables: { user: TokenPayload } }>;

export async function getAssignmentById(c: AuthedContext) {
    const { id } = c.req.valid("param" as never);
    const assignment = await getDoctorPatientAssignmentById(id);
    return c.json(assignment);
}

export async function getAssignmentsForPatient(c: AuthedContext) {
    const { patientId } = c.req.valid("param" as never);
    const assignments = await getActiveAssignmentsForPatient(patientId);
    return c.json(assignments);
}

export async function getAssignmentsForDoctor(c: AuthedContext) {
    const { doctorId } = c.req.valid("param" as never);
    const assignments = await getActiveAssignmentsForDoctor(doctorId);
    return c.json(assignments);
}

export async function createAssignment(c: AuthedContext) {
    const input = c.req.valid("json" as never);
    const user = c.get("user").sub;
    const assignment = await createDoctorPatientAssignment(input, user);
    return c.json(assignment, 201);
}

export async function finalizeAssignment(c: AuthedContext) {
    const { id } = c.req.valid("param" as never);
    const { fechaFinalizacion } = c.req.valid("json" as never);
    const user = c.get("user").sub;
    const assignment = await finalizeDoctorPatientAssignment(id, fechaFinalizacion, user);
    return c.json(assignment);
}