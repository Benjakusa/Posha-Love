import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(16).default('dev-only-secret-change-me-please-1234'),
  JWT_EXPIRES_IN: z.string().default('4h'),
  STORAGE_DRIVER: z.enum(['memory', 'postgres']).default('memory'),
  GUEST_SESSION_TTL_SECONDS: z.coerce.number().default(4 * 60 * 60),
  GUEST_VIDEO_MAX_SECONDS: z.coerce.number().default(120),
  FOLLOWER_VIDEO_MAX_SECONDS: z.coerce.number().default(30 * 60),
  GATE_GUEST_ACCESS: z.enum(['on', 'off']).default('on'),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('Invalid environment:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
}
