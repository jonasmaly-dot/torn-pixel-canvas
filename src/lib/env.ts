import { z } from "zod";
export const env = z.object({ DATABASE_URL: z.string().url(), SESSION_SECRET: z.string().min(32), ADMIN_TORN_ID: z.coerce.number().int().positive(), ADMIN_TORN_API_KEY: z.string().min(16) }).parse(process.env);
