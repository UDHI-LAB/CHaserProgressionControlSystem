import { z } from 'zod';
import { screenIdSchema } from './domain';

/** POST /api/screen */
export const changeScreenRequestSchema = z.object({
  screen: screenIdSchema,
});
export type ChangeScreenRequest = z.infer<typeof changeScreenRequestSchema>;

/** エラーレスポンスの統一形。§7 */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export function apiError(code: string, message: string): ApiError {
  return { error: { code, message } };
}
