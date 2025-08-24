export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"type-enum": [
			2,
			"always",
			[
				"feat", // New feature
				"fix", // Bug fix
				"docs", // Documentation changes
				"style", // Code style changes (formatting, missing semicolons, etc)
				"refactor", // Code refactoring
				"perf", // Performance improvements
				"test", // Adding or updating tests
				"chore", // Build process, tooling changes
				"ci", // CI/CD changes
				"revert", // Revert previous commit
			],
		],
		"scope-enum": [
			2,
			"always",
			[
                // Root
				"root",

                // Apps
                "portfolio",
                "mods",

                // Packages
                "tsconfig"
			],
		],
		"scope-empty": [2, "never"],
		"subject-case": [2, "always", "lower-case"],
		"subject-empty": [2, "never"],
		"subject-full-stop": [2, "never", "."],
		"header-max-length": [2, "always", 72],
	},
};