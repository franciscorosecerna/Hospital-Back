import { z } from 'zod';

export const loginSchema = z.object({
  documento: z.string().min(1),
  tipoDocumento: z.string().min(1),
  password: z.string().min(1),
});
 
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});