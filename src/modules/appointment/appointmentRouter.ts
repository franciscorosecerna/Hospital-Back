import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { TokenPayload } from "../authorization/authorizationService";
import {
    getAppointmentHandler,
    getAppointmentsForPatientHandler,
    getAppointmentsForDoctorHandler,
    createAppointmentHandler,
    updateAppointmentHandler,
    confirmAppointmentHandler,
    cancelAppointmentHandler,
    completeAppointmentHandler,
} from "./appointmentController";
import {
    appointmentIdParamSchema,
    patientIdParamSchema,
    doctorIdParamSchema,
    paginationQuerySchema,
    createAppointmentSchema,
    updateAppointmentSchema,
} from "./appointmentSchema";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requirePermission } from "../../middleware/permissionMiddleware";

const appointmentRouter = new Hono<{ Variables: { user: TokenPayload } }>();

appointmentRouter.get(
    "/patient/:patientId",
    authMiddleware,
    requirePermission("appointments:read"),
    zValidator("param", patientIdParamSchema),
    getAppointmentsForPatientHandler
);

appointmentRouter.get(
    "/doctor/:doctorId",
    authMiddleware,
    requirePermission("appointments:read"),
    zValidator("param", doctorIdParamSchema),
    zValidator("query", paginationQuerySchema),
    getAppointmentsForDoctorHandler
);

appointmentRouter.get(
    "/:appointmentId",
    authMiddleware,
    requirePermission("appointments:read"),
    zValidator("param", appointmentIdParamSchema),
    getAppointmentHandler
);

appointmentRouter.post(
    "/",
    authMiddleware,
    requirePermission("appointments:create"),
    zValidator("json", createAppointmentSchema),
    createAppointmentHandler
);

appointmentRouter.patch(
    "/:appointmentId",
    authMiddleware,
    requirePermission("appointments:update"),
    zValidator("param", appointmentIdParamSchema),
    zValidator("json", updateAppointmentSchema),
    updateAppointmentHandler
);

appointmentRouter.patch(
    "/:appointmentId/confirm",
    authMiddleware,
    requirePermission("appointments:update"),
    zValidator("param", appointmentIdParamSchema),
    confirmAppointmentHandler
);

appointmentRouter.patch(
    "/:appointmentId/cancel",
    authMiddleware,
    requirePermission("appointments:update"),
    zValidator("param", appointmentIdParamSchema),
    cancelAppointmentHandler
);

appointmentRouter.patch(
    "/:appointmentId/complete",
    authMiddleware,
    requirePermission("appointments:update"),
    zValidator("param", appointmentIdParamSchema),
    completeAppointmentHandler
);

export default appointmentRouter;