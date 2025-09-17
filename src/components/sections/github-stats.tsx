import { Github } from "lucide-react";
import { CommitGraph } from "@/components/github/commit-graph";
import { GitHubStatsDisplay } from "@/components/github/github-stats-display";
import { Card, CardContent } from "@/components/ui/card";
import { ClientDate } from "@/components/ui/client-date";
import type { GitHubStats, GitHubStatsResponse } from "@/types/github";

async function getGitHubStats(): Promise<GitHubStats | null> {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_APP_URL}/api/github-stats`,
			{
				next: { revalidate: 300 },
			},
		);

		if (!response.ok) {
			console.error(`GitHub API Error: ${response.status}`);
			return null;
		}

		const result: GitHubStatsResponse = await response.json();

		if (!result.success || !result.data) {
			console.error("GitHub API returned error:", result.error);
			return null;
		}

		return result.data;
	} catch (error) {
		console.error("Failed to fetch GitHub stats:", error);
		return null;
	}
}

export async function GithubStats({ id }: { id?: string }) {
	const stats = await getGitHubStats();

	if (!stats) {
		return (
			<section id={id} className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
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
		<section id={id} className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
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
							Last updated: <ClientDate dateString={stats.lastUpdated} />
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
