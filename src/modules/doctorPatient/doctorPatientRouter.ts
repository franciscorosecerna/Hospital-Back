import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { TokenPayload } from "../authorization/authorizationService";
import {
    getAssignmentById,
    getAssignmentsForPatient,
    getAssignmentsForDoctor,
    createAssignment,
    finalizeAssignment,
} from "./doctorPatientController";
import {
    assignmentIdParamSchema,
    patientIdParamSchema,
    doctorIdParamSchema,
    paginationQuerySchema,
    createAssignmentSchema,
    finalizeAssignmentSchema,
} from "./doctorPatientSchema";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requirePermission } from "../../middleware/permissionMiddleware";

const doctorPatientRouter = new Hono<{ Variables: { user: TokenPayload } }>();

doctorPatientRouter.get(
    "/:id",
    authMiddleware,
    requirePermission("doctorPatient:read"),
    zValidator("param", assignmentIdParamSchema),
    getAssignmentById
);

doctorPatientRouter.get(
    "/patient/:patientId",
    authMiddleware,
    requirePermission("doctorPatient:read"),
    zValidator("param", patientIdParamSchema),
    getAssignmentsForPatient
);

doctorPatientRouter.get(
    "/doctor/:doctorId",
    authMiddleware,
    requirePermission("doctorPatient:read"),
    zValidator("param", doctorIdParamSchema),
    zValidator("query", paginationQuerySchema),
    getAssignmentsForDoctor
);

doctorPatientRouter.post(
    "/",
    authMiddleware,
    requirePermission("doctorPatient:create"),
    zValidator("json", createAssignmentSchema),
    createAssignment
);

doctorPatientRouter.patch(
    "/:id/finalize",
    authMiddleware,
    requirePermission("doctorPatient:update"),
    zValidator("param", assignmentIdParamSchema),
    zValidator("json", finalizeAssignmentSchema),
    finalizeAssignment
);

export default doctorPatientRouter;