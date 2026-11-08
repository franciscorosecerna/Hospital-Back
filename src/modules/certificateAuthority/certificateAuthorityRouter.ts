import { Hono } from "hono";
import type { TokenPayload } from "../authorization/authorizationService";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requirePermission, requireRole } from "../../middleware/permissionMiddleware";
import { zValidator } from "../../utils/validator";
import {
  createCertificateAuthority,
  getCertificateAuthority,
  getDoctorCertificate,
  listCertificateAuthorities,
  listCertificatesByDoctor,
  registerDoctorCertificate,
  revokeDoctorCertificate,
} from "./certificateAuthorityController";
import {
  createCertificateAuthoritySchema,
  doctorIdParamSchema,
  idParamSchema,
  paginationQuerySchema,
  registerDoctorCertificateSchema,
  revokeDoctorCertificateSchema,
} from "./certificateAuthoritySchema";

export const certificateAuthorityRouter = new Hono<{ Variables: { user: TokenPayload } }>();

certificateAuthorityRouter.get(
  "/",
  authMiddleware,
  requireRole("admin", "doctor"),
  requirePermission("certificate_authorities:read"),
  zValidator("query", paginationQuerySchema),
  listCertificateAuthorities,
);

certificateAuthorityRouter.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  requirePermission("certificate_authorities:create"),
  zValidator("json", createCertificateAuthoritySchema),
  createCertificateAuthority,
);

certificateAuthorityRouter.get(
  "/certificates/doctor/:doctorId",
  authMiddleware,
  requireRole("admin", "doctor"),
  requirePermission("certificate_authorities:read"),
  zValidator("param", doctorIdParamSchema),
  zValidator("query", paginationQuerySchema),
  listCertificatesByDoctor,
);

certificateAuthorityRouter.get(
  "/certificates/:id",
  authMiddleware,
  requireRole("admin", "doctor"),
  requirePermission("certificate_authorities:read"),
  zValidator("param", idParamSchema),
  getDoctorCertificate,
);

certificateAuthorityRouter.post(
  "/certificates",
  authMiddleware,
  requireRole("admin", "doctor"),
  requirePermission("certificate_authorities:create"),
  zValidator("json", registerDoctorCertificateSchema),
  registerDoctorCertificate,
);

certificateAuthorityRouter.post(
  "/certificates/:id/revoke",
  authMiddleware,
  requireRole("admin", "doctor"),
  requirePermission("certificate_authorities:revoke"),
  zValidator("param", idParamSchema),
  zValidator("json", revokeDoctorCertificateSchema),
  revokeDoctorCertificate,
);

certificateAuthorityRouter.get(
  "/:id",
  authMiddleware,
  requireRole("admin", "doctor"),
  requirePermission("certificate_authorities:read"),
  zValidator("param", idParamSchema),
  getCertificateAuthority,
);

export default certificateAuthorityRouter;