import { asc, desc, eq } from "drizzle-orm";
import { db } from "../../db/client";
import { certificateAuthorities, doctorCertificates } from "../../db/schema/prescriptions";
import {
  ConflictStateException,
  parsePgError,
  RecordNotFoundException,
} from "../../utils/exceptions";
import { insertAuditLogTx } from "../auditLogs/auditLogRepository";

export type CertificateAuthority = typeof certificateAuthorities.$inferSelect;
export type NewCertificateAuthority = typeof certificateAuthorities.$inferInsert;
export type DoctorCertificate = typeof doctorCertificates.$inferSelect;
export type NewDoctorCertificate = typeof doctorCertificates.$inferInsert;

export async function listCertificateAuthorities(
  limit: number = 20,
  offset: number = 0,
): Promise<CertificateAuthority[]> {
  try {
    return await db
      .select()
      .from(certificateAuthorities)
      .orderBy(asc(certificateAuthorities.nombre))
      .limit(limit)
      .offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getCertificateAuthorityById(id: string): Promise<CertificateAuthority> {
  try {
    const [ca] = await db.select().from(certificateAuthorities).where(eq(certificateAuthorities.id, id));
    if (!ca) throw new RecordNotFoundException("certificate_authorities", id);
    return ca;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createCertificateAuthority(
  data: Omit<NewCertificateAuthority, "id">,
  performedBy: string,
): Promise<CertificateAuthority> {
  try {
    return await db.transaction(async (tx) => {
      const [created] = await tx.insert(certificateAuthorities).values(data).returning();
      if (!created) throw new Error("Failed to create certificate authority");
      await insertAuditLogTx(
        tx,
        "created",
        "certificate_authorities",
        created.id,
        undefined,
        created,
        performedBy,
      );
      return created;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getCertificateWithCaById(
  certificateId: string,
): Promise<{ certificate: DoctorCertificate; ca: CertificateAuthority } | undefined> {
  try {
    const [record] = await db
      .select({
        certificate: doctorCertificates,
        ca: certificateAuthorities,
      })
      .from(doctorCertificates)
      .innerJoin(certificateAuthorities, eq(doctorCertificates.caId, certificateAuthorities.id))
      .where(eq(doctorCertificates.id, certificateId));
    return record;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function getDoctorCertificateById(id: string): Promise<DoctorCertificate> {
  try {
    const [certificate] = await db.select().from(doctorCertificates).where(eq(doctorCertificates.id, id));
    if (!certificate) throw new RecordNotFoundException("doctor_certificates", id);
    return certificate;
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function listCertificatesByDoctor(
  doctorId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<DoctorCertificate[]> {
  try {
    return await db
      .select()
      .from(doctorCertificates)
      .where(eq(doctorCertificates.doctorId, doctorId))
      .orderBy(desc(doctorCertificates.validoDesde))
      .limit(limit)
      .offset(offset);
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function createDoctorCertificate(
  data: Omit<NewDoctorCertificate, "id" | "revokedAt" | "motivoRevocacion">,
  performedBy: string,
): Promise<DoctorCertificate> {
  try {
    return await db.transaction(async (tx) => {
      const [created] = await tx.insert(doctorCertificates).values(data).returning();
      if (!created) throw new Error("Failed to register doctor certificate");
      await insertAuditLogTx(tx, "created", "doctor_certificates", created.id, undefined, created, performedBy);
      return created;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}

export async function revokeDoctorCertificate(
  id: string,
  motivoRevocacion: string,
  performedBy: string,
): Promise<DoctorCertificate> {
  try {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(doctorCertificates)
        .where(eq(doctorCertificates.id, id))
        .for("update");
      if (!existing) throw new RecordNotFoundException("doctor_certificates", id);

      if (existing.revokedAt) {
        throw new ConflictStateException("El certificado digital ya se encuentra revocado.");
      }

      const [updated] = await tx
        .update(doctorCertificates)
        .set({
          revokedAt: new Date(),
          motivoRevocacion,
        })
        .where(eq(doctorCertificates.id, id))
        .returning();
      if (!updated) throw new RecordNotFoundException("doctor_certificates", id);

      await insertAuditLogTx(tx, "updated", "doctor_certificates", id, existing, updated, performedBy);
      return updated;
    });
  } catch (err) {
    throw parsePgError(err);
  }
}