import { Hono } from "hono";
import type { TokenPayload } from "../authorization/authorizationService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requirePermission, requireRole } from "../../middleware/permissionMiddleware";
import { rateLimitMiddleware } from "../../middleware/rateLimitMiddleware";
import { zValidator } from "../../utils/validator";
import {
  annulPrescription,
  createPrescription,
  deletePrescription,
  getPrescription,
  getPrescriptionByAppointment,
  getPrescriptionHash,
  getPrescriptionsByDoctor,
  getPrescriptionsByPatient,
  signPrescription,
  updatePrescription,
  verifyPrescription,
  verifyPrescriptionPublic,
} from "./prescriptionController";
import {
  annulPrescriptionSchema,
  appointmentIdParamSchema,
  createPrescriptionSchema,
  doctorIdParamSchema,
  idParamSchema,
  paginationQuerySchema,
  patientIdParamSchema,
  publicVerifyPrescriptionSchema,
  signPrescriptionSchema,
  updatePrescriptionSchema,
} from "./prescriptionSchema";

export const prescriptionRouter = new Hono<{ Variables: { user: TokenPayload } }>();

const publicVerifyRateLimiter = rateLimitMiddleware({
  windowMs: 60 * 1000,
  maxRequests: 30,
});

prescriptionRouter.post(
  "/public/:id/verify",
  publicVerifyRateLimiter,
  zValidator("param", idParamSchema),
  zValidator("json", publicVerifyPrescriptionSchema),
  verifyPrescriptionPublic,
);

prescriptionRouter.post(
  "/",
  authMiddleware,
  requireRole("doctor"),
  requirePermission("prescriptions:create"),
  zValidator("json", createPrescriptionSchema),
  createPrescription,
);

prescriptionRouter.get(
  "/appointment/:appointmentId",
  authMiddleware,
  requireRole("admin", "doctor", "nurse", "patient"),
  requirePermission("prescriptions:read"),
  zValidator("param", appointmentIdParamSchema),
  getPrescriptionByAppointment,
);

prescriptionRouter.get(
  "/patient/:patientId",
  authMiddleware,
  requireRole("admin", "doctor", "nurse", "patient"),
  requirePermission("prescriptions:read"),
  zValidator("param", patientIdParamSchema),
  zValidator("query", paginationQuerySchema),
  getPrescriptionsByPatient,
);

prescriptionRouter.get(
  "/doctor/:doctorId",
  authMiddleware,
  requireRole("admin", "doctor", "nurse"),
  requirePermission("prescriptions:read"),
  zValidator("param", doctorIdParamSchema),
  zValidator("query", paginationQuerySchema),
  getPrescriptionsByDoctor,
);

prescriptionRouter.get(
  "/:id/hash",
  authMiddleware,
  requireRole("doctor"),
  requirePermission("prescriptions:sign"),
  zValidator("param", idParamSchema),
  getPrescriptionHash,
);

prescriptionRouter.get(
  "/:id",
  authMiddleware,
  requireRole("admin", "doctor", "nurse", "patient"),
  requirePermission("prescriptions:read"),
  zValidator("param", idParamSchema),
  getPrescription,
);

prescriptionRouter.patch(
  "/:id",
  authMiddleware,
  requireRole("doctor"),
  requirePermission("prescriptions:update"),
  zValidator("param", idParamSchema),
  zValidator("json", updatePrescriptionSchema),
  updatePrescription,
);

prescriptionRouter.delete(
  "/:id",
  authMiddleware,
  requireRole("doctor"),
  requirePermission("prescriptions:delete"),
  zValidator("param", idParamSchema),
  deletePrescription,
);

prescriptionRouter.post(
  "/:id/sign",
  authMiddleware,
  requireRole("doctor"),
  requirePermission("prescriptions:sign"),
  zValidator("param", idParamSchema),
  zValidator("json", signPrescriptionSchema),
  signPrescription,
);

prescriptionRouter.post(
  "/:id/verify",
  authMiddleware,
  requireRole("admin", "doctor", "nurse", "patient"),
  requirePermission("prescriptions:read"),
  zValidator("param", idParamSchema),
  verifyPrescription,
);

prescriptionRouter.post(
  "/:id/annul",
  authMiddleware,
  requireRole("doctor"),
  requirePermission("prescriptions:annul"),
  zValidator("param", idParamSchema),
  zValidator("json", annulPrescriptionSchema),
  annulPrescription,
);

export default prescriptionRouter;