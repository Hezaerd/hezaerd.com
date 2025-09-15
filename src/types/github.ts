export interface GitHubUser {
	login: string;
	name: string | null;
	avatar_url: string;
	bio: string | null;
	location: string | null;
	email: string | null;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	created_at: string;
	updated_at: string;
}

export interface GitHubRepository {
	id: number;
	name: string;
	full_name: string;
	description: string | null;
	html_url: string;
	language: string | null;
	stargazers_count: number;
	watchers_count: number;
	forks_count: number;
	size: number;
	created_at: string;
	updated_at: string;
	pushed_at: string;
	topics: string[];
	archived: boolean;
	fork: boolean;
}

export interface GitHubLanguageStats {
	[language: string]: number;
}

export interface ContributionDay {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4; // GitHub's contribution levels
}

export interface ContributionWeek {
	contributionDays: ContributionDay[];
	firstDay: string;
}

export interface GitHubContributions {
	totalContributions: number;
	weeks: ContributionWeek[];
	fromYear: number;
	toYear: number;
}

export interface GitHubStats {
	user: GitHubUser;
	topRepositories: GitHubRepository[];
	totalStars: number;
	favoriteLanguage: string | null;
	languageStats: GitHubLanguageStats;
	contributions: GitHubContributions;
	lastUpdated: string;
}

export interface GitHubStatsResponse {
	success: boolean;
	data?: GitHubStats;
	error?: string;
	rateLimitRemaining?: number;
}

// For the commit graph component
export interface CommitGraphData {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
}

export interface GitHubStatsConfig {
	enabled: boolean;
	token?: string;
}
