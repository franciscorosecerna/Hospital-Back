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

export const documentoParamSchema = z.object({
  tipoDocumento: z.string().min(1),
  documento: z.string().min(1),
});

export const matriculaParamSchema = z.object({
  matricula: z.string().min(1),
});

export const departmentIdParamSchema = z.object({
  departmentId: z.uuid("El ID de departamento debe ser un UUID válido"),
});

export const turnoParamSchema = z.object({
  turno: z.string().min(1).max(64),
});

export const historiaClinicaParamSchema = z.object({
  numeroHistoriaClinica: z.string().min(1),
});

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  page: z.coerce.number().int().positive().optional().default(1),
});

export type BaseUserInput = z.infer<typeof baseUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type CreateNurseInput = z.infer<typeof createNurseSchema>;
export type UpdateNurseInput = z.infer<typeof updateNurseSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type DocumentoParam = z.infer<typeof documentoParamSchema>;
export type MatriculaParam = z.infer<typeof matriculaParamSchema>;
export type DepartmentIdParam = z.infer<typeof departmentIdParamSchema>;
export type TurnoParam = z.infer<typeof turnoParamSchema>;
export type HistoriaClinicaParam = z.infer<typeof historiaClinicaParamSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;