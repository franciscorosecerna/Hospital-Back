import { z } from "zod";

export const baseUserSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(256),
  apellido: z.string().min(1, "El apellido es requerido").max(256),
  tipoDocumento: z.enum(["DNI", "PASAPORTE", "CUIL", "CUIT"], {
    error: "Tipo de documento inválido. Opciones: DNI, PASAPORTE, CUIL, CUIT",
  }),
  documento: z.string().min(1, "El documento es requerido").max(64),
  fechaNacimiento: z
    .date("La fecha de nacimiento debe ser una fecha válida"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(256),
});

export const updateUserSchema = z.object({
  nombre: z.string().min(1).max(256).optional(),
  apellido: z.string().min(1).max(256).optional(),
  fechaNacimiento: z
    .date("La fecha de nacimiento debe ser una fecha válida")
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres").max(256),
});

export const createDoctorSchema = baseUserSchema.extend({
  matricula: z.string().min(1, "La matrícula es requerida").max(128),
  especialidad: z.string().max(128).optional(),
});

export const updateDoctorSchema = z.object({
  matricula: z.string().min(1).max(128).optional(),
  especialidad: z.string().max(128).optional(),
});

export const createPatientSchema = baseUserSchema.extend({
  numeroHistoriaClinica: z.string().max(128).optional(),
  grupoSanguineo: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
      error: "Grupo sanguíneo inválido",
    })
    .optional(),
});

export const updatePatientSchema = z.object({
  numeroHistoriaClinica: z.string().max(128).optional(),
  grupoSanguineo: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
      error: "Grupo sanguíneo inválido",
    })
    .optional(),
});

export const createNurseSchema = baseUserSchema.extend({
  departmentId: z.uuid("El ID de departamento debe ser un UUID válido"),
  turno: z.string().min(1, "El turno es requerido").max(64),
});

export const updateNurseSchema = z.object({
  departmentId: z.uuid("El ID de departamento debe ser un UUID válido").optional(),
  turno: z.string().min(1).max(64).optional(),
});

export const idParamSchema = z.object({
  id: z.uuid("El ID debe ser un UUID válido"),
});

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  page: z.coerce.number().int().positive().optional().default(1),
});