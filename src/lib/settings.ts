import { z } from "zod";

// Define the schema for environment variables with optional fields
const envSchema = z.object({
	// Google Analytics - Optional, can be set through onboarding
	NEXT_PUBLIC_GA_ID: z.string().optional(),

	// App Configuration
	NEXT_PUBLIC_SITE_URL: z
		.string()
		.url({ message: "Invalid site URL" })
		.optional()
		.default("http://localhost:3000"),

	// GitHub Token - Optional, can be set through onboarding
	GITHUB_TOKEN: z.string().optional(),

	// Node environment
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
});

// Type for the validated environment
export type Environment = z.infer<typeof envSchema>;

// Function to validate and get environment variables
function getEnvironment(): Environment {
	const env = {
		NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
		GITHUB_TOKEN: process.env.GITHUB_TOKEN,
		NODE_ENV: process.env.NODE_ENV,
	};

	try {
		return envSchema.parse(env);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.issues.map(
				(issue: z.ZodIssue) => `${issue.path.join(".")}: ${issue.message}`,
			);
			console.warn(
				`Environment validation warnings:\n${errorMessages.join("\n")}`,
			);
			// Return a safe default environment instead of throwing
			return {
				NEXT_PUBLIC_GA_ID: undefined,
				NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
				GITHUB_TOKEN: undefined,
				NODE_ENV: "development" as const,
			};
		}
		throw error;
	}
}

// Export the validated environment
export const env = getEnvironment();

// Helper functions for specific configurations
export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

// Analytics configuration - only enabled if GA_ID is present
export const analyticsConfig = {
	gaId: env.NEXT_PUBLIC_GA_ID,
	enabled: isProduction && !!env.NEXT_PUBLIC_GA_ID, // Only enable if GA_ID exists and in production
} as const;

// GitHub configuration - only enabled if token is present
export const githubConfig = {
	token: env.GITHUB_TOKEN,
	enabled: !!env.GITHUB_TOKEN, // Only enabled if token exists
} as const;

// Site configuration
export const siteConfig = {
	url: env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
} as const;

// Helper function to check if environment is fully configured
export const isEnvironmentConfigured = () => {
	return !!(env.NEXT_PUBLIC_GA_ID && env.GITHUB_TOKEN);
};

// Helper function to get missing environment variables
export const getMissingEnvironmentVars = (): string[] => {
	const missing: string[] = [];

	if (!env.NEXT_PUBLIC_GA_ID) {
		missing.push("NEXT_PUBLIC_GA_ID");
	}

	if (!env.GITHUB_TOKEN) {
		missing.push("GITHUB_TOKEN");
	}

	return missing;
};
