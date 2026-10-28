import z from "zod";

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  page: z.coerce.number().int().positive().optional().default(1),
});

const uuid = z.uuid("Debe ser un UUID válido");

export const APPOINTMENT_STATES = [
    "Pendiente",
    "Confirmada",
    "Cancelada",
    "Completada",
] as const;
export const appointmentStateSchema = z.enum(APPOINTMENT_STATES);

const fechaHora = z
    .iso.datetime({ offset: true, error: "Use formato ISO 8601 con zona horaria" })
    .transform((v) => new Date(v))
    .refine((d) => d.getTime() > Date.now(), "La fecha y hora debe ser futura"
);

const motivo = z.string().trim().min(1, "El motivo no puede estar vacío").max(512);
const notas = z.string().trim().min(1, "Las notas no pueden estar vacías").max(1024);

export const appointmentIdParamSchema = z.object({
    appointmentId: uuid,
});

export const patientIdParamSchema = z.object({
    patientId: uuid,
});

export const doctorIdParamSchema = z.object({
    doctorId: uuid,
});

export const createAppointmentSchema = z.object({
    patientId: uuid,
    doctorId: uuid,
    fechaHora,
    motivo: motivo.optional(),
    notas: notas.optional(),
});

export const updateAppointmentSchema = z
    .object({
        fechaHora: fechaHora.optional(),
        motivo: motivo.optional(),
        notas: notas.optional(),
    })
    .refine(
        (v) => Object.values(v).some((x) => x !== undefined),
        "Debe enviar al menos un campo para actualizar"
);

export type AppointmentState = z.infer<typeof appointmentStateSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;