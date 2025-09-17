import { Github } from "lucide-react";
import { CommitGraph } from "@/components/github/commit-graph";
import { GitHubStatsDisplay } from "@/components/github/github-stats-display";
import { Card, CardContent } from "@/components/ui/card";
import type {
	ContributionDay,
	ContributionWeek,
	GitHubContributions,
	GitHubLanguageStats,
	GitHubRepository,
	GitHubStats,
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
		next: { revalidate: 300 }, // Revalidate every 5 minutes
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
	const repos = await fetchGitHubAPI(
		`/users/${username}/repos?type=public&sort=updated&per_page=100`,
		token,
	);

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

	for (let week = 0; week < totalWeeks; week++) {
		const contributionDays: ContributionDay[] = [];

		for (let day = 0; day < daysPerWeek; day++) {
			const date = new Date(oneYearAgo);
			date.setDate(date.getDate() + week * daysPerWeek + day);

			if (date > now) break;

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

async function getGitHubStats(): Promise<GitHubStats | null> {
	try {
		const token = process.env.GITHUB_TOKEN;

		if (!token) {
			console.error("GitHub token not configured");
			return null;
		}

		const user = await fetchUserData(token);
		const repositories = await fetchUserRepositories(user.login, token);
		const topRepositories = repositories.slice(0, 6);
		const totalStars = repositories.reduce(
			(sum, repo) => sum + repo.stargazers_count,
			0,
		);
		const languageStats = await calculateLanguageStats(
			repositories,
			user.login,
			token,
		);
		const favoriteLanguage =
			Object.keys(languageStats).length > 0
				? Object.entries(languageStats).sort(([, a], [, b]) => b - a)[0][0]
				: null;
		const contributions = await generateContributionsData(repositories);

		return {
			user,
			topRepositories,
			totalStars,
			favoriteLanguage,
			languageStats,
			contributions,
			lastUpdated: new Date().toISOString(),
		};
	} catch (error) {
		console.error("GitHub API Error:", error);
		return null;
	}
}

export async function GithubStats({ id }: { id?: string }) {
	const stats = await getGitHubStats();

	if (!stats) {
		return (
			<section
				id={id}
				className="py-16 px-4 sm:px-6 lg:px-8 bg-background"
			>
				<div className="max-w-7xl mx-auto">
					<h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12 flex items-center justify-center gap-2">
						<Github className="w-7 h-7 text-primary" /> GitHub Stats
					</h2>
					<Card>
						<CardContent className="p-16 text-center">
							<p className="text-muted-foreground">
								GitHub stats temporarily unavailable
							</p>
						</CardContent>
					</Card>
				</div>
			</section>
		);
	}

	return (
		<section
			id={id}
			className="py-16 px-4 sm:px-6 lg:px-8 bg-background"
		>
			<div className="max-w-7xl mx-auto">
				<h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12 flex items-center justify-center gap-2">
					<Github className="w-7 h-7 text-primary" /> GitHub Stats
				</h2>

				<div className="space-y-8">
					{/* Stats Overview */}
					<GitHubStatsDisplay stats={stats} />

					{/* Contribution Graph */}
					<Card>
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold mb-6 flex items-center">
								<Github className="w-5 h-5 mr-2" />
								Contribution Activity
							</h3>
							<CommitGraph contributions={stats.contributions} />
						</CardContent>
					</Card>

					{/* Last Updated */}
					<div className="text-center">
						<p className="text-sm text-muted-foreground">
							Last updated: {new Date(stats.lastUpdated).toLocaleString()}
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
