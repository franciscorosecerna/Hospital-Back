import { z } from 'zod';

export const loginSchema = z.object({
  documento: z.string().min(1, "El documento es requerido"),
  tipoDocumento: z.enum(["DNI", "PASAPORTE", "CUIL", "CUIT"], {
    error: "Tipo de documento inválido. Opciones: DNI, PASAPORTE, CUIL, CUIT"
  }),
  password: z.string().min(1, "La contraseña es requerida"),
});
 
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "El refresh token es requerido"),
});