import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import type {
	ContributionDay,
	ContributionWeek,
	GitHubContributions,
	GitHubLanguageStats,
	GitHubRepository,
	GitHubStats,
	GitHubStatsResponse,
	GitHubUser,
} from "@/types/github";

const GITHUB_API_BASE = "https://api.github.com";

async function fetchGitHubAPI(endpoint: string, token: string) {
	const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/vnd.github.v3+json",
			"User-Agent": "Portfolio-App",
		},
	});

	if (!response.ok) {
		throw new Error(
			`GitHub API Error: ${response.status} ${response.statusText}`,
		);
	}

	return response.json();
}

async function fetchUserData(token: string): Promise<GitHubUser> {
	return await fetchGitHubAPI("/user", token);
}

async function fetchUserRepositories(
	username: string,
	token: string,
): Promise<GitHubRepository[]> {
	// Fetch public repositories, sorted by stars
	const repos = await fetchGitHubAPI(
		`/users/${username}/repos?type=public&sort=updated&per_page=100`,
		token,
	);

	// Filter out forks and sort by stars
	return repos
		.filter((repo: GitHubRepository) => !repo.fork && !repo.archived)
		.sort(
			(a: GitHubRepository, b: GitHubRepository) =>
				b.stargazers_count - a.stargazers_count,
		);
}

async function calculateLanguageStats(
	repositories: GitHubRepository[],
	username: string,
	token: string,
): Promise<GitHubLanguageStats> {
	const languageStats: GitHubLanguageStats = {};

	// Fetch languages for top repositories (limit to first 20 to avoid rate limits)
	const topRepos = repositories.slice(0, 20);

	for (const repo of topRepos) {
		try {
			const languages = await fetchGitHubAPI(
				`/repos/${username}/${repo.name}/languages`,
				token,
			);

			Object.entries(languages).forEach(([language, bytes]) => {
				languageStats[language] =
					(languageStats[language] || 0) + (bytes as number);
			});
		} catch (error) {
			console.warn(`Failed to fetch languages for ${repo.name}:`, error);
		}
	}

	return languageStats;
}

// GitHub doesn't provide contribution data via API for private data
// We'll create a simplified version using repository activity
async function generateContributionsData(
	repositories: GitHubRepository[],
): Promise<GitHubContributions> {
	const now = new Date();
	const oneYearAgo = new Date();
	oneYearAgo.setFullYear(now.getFullYear() - 1);

	const weeks: ContributionWeek[] = [];
	const totalDays = 365;
	const daysPerWeek = 7;
	const totalWeeks = Math.ceil(totalDays / daysPerWeek);

	// Create contribution data based on repository activity
	for (let week = 0; week < totalWeeks; week++) {
		const contributionDays: ContributionDay[] = [];

		for (let day = 0; day < daysPerWeek; day++) {
			const date = new Date(oneYearAgo);
			date.setDate(date.getDate() + week * daysPerWeek + day);

			if (date > now) break;

			// Simulate contribution count based on repository activity
			// In a real implementation, you might use Git commits data
			const repoActivity = repositories.filter((repo) => {
				const pushDate = new Date(repo.pushed_at);
				const dayStart = new Date(date);
				const dayEnd = new Date(date);
				dayEnd.setDate(dayEnd.getDate() + 1);
				return pushDate >= dayStart && pushDate < dayEnd;
			}).length;

			const count = repoActivity;
			let level: 0 | 1 | 2 | 3 | 4 = 0;

			if (count > 0) level = 1;
			if (count > 2) level = 2;
			if (count > 5) level = 3;
			if (count > 10) level = 4;

			contributionDays.push({
				date: date.toISOString().split("T")[0],
				count,
				level,
			});
		}

		if (contributionDays.length > 0) {
			weeks.push({
				contributionDays,
				firstDay: contributionDays[0].date,
			});
		}
	}

	const totalContributions = weeks.reduce(
		(total, week) =>
			total + week.contributionDays.reduce((sum, day) => sum + day.count, 0),
		0,
	);

	return {
		totalContributions,
		weeks,
		fromYear: oneYearAgo.getFullYear(),
		toYear: now.getFullYear(),
	};
}

export async function GET(): Promise<NextResponse<GitHubStatsResponse>> {
	try {
		const token = env.GITHUB_TOKEN;

		if (!token) {
			return NextResponse.json({
				success: false,
				error: "GitHub token not configured",
			});
		}

		// Fetch user data
		const user = await fetchUserData(token);

		// Fetch repositories
		const repositories = await fetchUserRepositories(user.login, token);

		// Get top repositories (limit to 6 for display)
		const topRepositories = repositories.slice(0, 6);

		// Calculate total stars
		const totalStars = repositories.reduce(
			(sum, repo) => sum + repo.stargazers_count,
			0,
		);

		// Calculate language statistics
		const languageStats = await calculateLanguageStats(
			repositories,
			user.login,
			token,
		);

		// Find favorite language
		const favoriteLanguage =
			Object.keys(languageStats).length > 0
				? Object.entries(languageStats).sort(([, a], [, b]) => b - a)[0][0]
				: null;

		// Generate contributions data
		const contributions = await generateContributionsData(repositories);

		const stats: GitHubStats = {
			user,
			topRepositories,
			totalStars,
			favoriteLanguage,
			languageStats,
			contributions,
			lastUpdated: new Date().toISOString(),
		};

		return NextResponse.json({
			success: true,
			data: stats,
		});
	} catch (error) {
		console.error("GitHub API Error:", error);

		return NextResponse.json({
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to fetch GitHub stats",
		});
	}
}
