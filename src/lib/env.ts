import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production"]),
	NEXT_PUBLIC_SITE_URL: z.url(),

	GITHUB_TOKEN: z.string().min(1),
});

export const env = envSchema.parse(process.env);
