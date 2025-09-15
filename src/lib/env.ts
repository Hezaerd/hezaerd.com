import { z } from "zod";

const envSchema = z.object({
	GITHUB_TOKEN: z.string().min(1),
});

export const env = envSchema.parse(process.env);
