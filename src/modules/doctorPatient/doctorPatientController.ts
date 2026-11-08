import type { ValidatedContext } from "../../utils/validator";
import type {
    AssignmentIdParam,
    CreateAssignmentInput,
    DoctorIdParam,
    FinalizeAssignmentInput,
    PaginationQuery,
    PatientIdParam,
} from "./doctorPatientSchema";
import {
    getDoctorPatientAssignmentById,
    getActiveAssignmentsForPatient,
    getActiveAssignmentsForDoctor,
    createDoctorPatientAssignment,
    finalizeDoctorPatientAssignment,
} from "./doctorPatientService";

export async function getAssignmentById(c: ValidatedContext<unknown, AssignmentIdParam>) {
    const { id } = c.req.valid("param");
    const assignment = await getDoctorPatientAssignmentById(id);
    return c.json(assignment);
}

export async function getAssignmentsForPatient(c: ValidatedContext<unknown, PatientIdParam>) {
    const { patientId } = c.req.valid("param");
    const assignments = await getActiveAssignmentsForPatient(patientId);
    return c.json(assignments);
}

export async function getAssignmentsForDoctor(c: ValidatedContext<unknown, DoctorIdParam, PaginationQuery>) {
    const { doctorId } = c.req.valid("param");
    const { limit, page } = c.req.valid("query");
    const assignments = await getActiveAssignmentsForDoctor(doctorId, page, limit);
    return c.json(assignments);
}

export async function createAssignment(c: ValidatedContext<CreateAssignmentInput>) {
    const input = c.req.valid("json");
    const user = c.get("user").sub;
    const assignment = await createDoctorPatientAssignment(input, user);
    return c.json(assignment, 201);
}

export async function finalizeAssignment(c: ValidatedContext<FinalizeAssignmentInput, AssignmentIdParam>) {
    const { id } = c.req.valid("param");
    const { fechaFinalizacion } = c.req.valid("json");
    const user = c.get("user").sub;
    const assignment = await finalizeDoctorPatientAssignment(id, fechaFinalizacion, user);
    return c.json(assignment);
}