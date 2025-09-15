"use client";

import { AlertCircle, Github, Loader2, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { CommitGraph } from "@/components/github/CommitGraph";
import { GitHubStatsDisplay } from "@/components/github/GitHubStatsDisplay";
import { useSectionIds } from "@/components/providers/SectionIdsProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGitHubStats } from "@/hooks/useGitHubStats";

export function GithubStats() {
	const { sectionIds } = useSectionIds();
	const [formattedDate, setFormattedDate] = useState<string>("");
	const {
		data,
		isLoading,
		error,
		refetch,
		isRefetching,
		isFetching,
		isPlaceholderData,
	} = useGitHubStats();

	// Update formatted date on client side to prevent hydration mismatch
	useEffect(() => {
		if (data?.data?.lastUpdated) {
			setFormattedDate(new Date(data.data.lastUpdated).toLocaleString());
		}
	}, [data?.data?.lastUpdated]);

	const handleRetry = () => {
		refetch();
	};

	// Only show loading state if we have no data at all (first load)
	if (isLoading && !data) {
		return (
			<section
				id={sectionIds.githubStats}
				className="py-16 px-4 sm:px-6 lg:px-8 bg-background"
			>
				<div className="max-w-7xl mx-auto">
					<motion.h2
						className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12 flex items-center justify-center gap-2"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
					>
						<Github className="w-7 h-7 text-primary" /> GitHub Stats
					</motion.h2>

					<Card>
						<CardContent className="p-16 text-center">
							<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
							<p className="text-muted-foreground">
								Loading GitHub statistics...
							</p>
						</CardContent>
					</Card>
				</div>
			</section>
		);
	}

	// Show error state only if we have no cached data to fall back to
	if (error && !data) {
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch GitHub stats";

		return (
			<section
				id={sectionIds.githubStats}
				className="py-16 px-4 sm:px-6 lg:px-8 bg-background"
			>
				<div className="max-w-7xl mx-auto">
					<motion.h2
						className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12 flex items-center justify-center gap-2"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
					>
						<Github className="w-7 h-7 text-primary" /> GitHub Stats
					</motion.h2>

					<Card>
						<CardContent className="p-16 text-center">
							<AlertCircle className="w-8 h-8 mx-auto mb-4 text-destructive" />
							<h3 className="text-lg font-semibold mb-2">
								Failed to Load GitHub Stats
							</h3>
							<p className="text-muted-foreground mb-6 max-w-md mx-auto">
								{errorMessage.includes("token")
									? "GitHub token not configured. Please add your GitHub token in the onboarding settings."
									: `Error: ${errorMessage}`}
							</p>
							<Button
								onClick={handleRetry}
								disabled={isRefetching}
								variant="outline"
								className="min-w-[120px]"
							>
								{isRefetching ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Retrying...
									</>
								) : (
									<>
										<RefreshCw className="w-4 h-4 mr-2" />
										Try Again
									</>
								)}
							</Button>
						</CardContent>
					</Card>
				</div>
			</section>
		);
	}

	if (!data?.success || !data.data) {
		return null;
	}

	const stats = data.data;

	return (
		<section
			id={sectionIds.githubStats}
			className="py-16 px-4 sm:px-6 lg:px-8 bg-background"
		>
			<div className="max-w-7xl mx-auto">
				<motion.h2
					className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12 flex items-center justify-center gap-2"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
				>
					<Github className="w-7 h-7 text-primary" /> GitHub Stats
					{/* Show subtle loading indicator when background refreshing */}
					{isFetching && !isRefetching && (
						<Loader2 className="w-4 h-4 animate-spin text-muted-foreground opacity-50" />
					)}
				</motion.h2>

				<div className="space-y-8">
					{/* Stats Overview */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						viewport={{ once: true }}
						className={isPlaceholderData ? "opacity-75" : "opacity-100"}
					>
						<GitHubStatsDisplay stats={stats} />
					</motion.div>

					{/* Contribution Graph */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						viewport={{ once: true }}
						className={isPlaceholderData ? "opacity-75" : "opacity-100"}
					>
						<Card>
							<CardContent className="p-6">
								<h3 className="text-lg font-semibold mb-6 flex items-center">
									<Github className="w-5 h-5 mr-2" />
									Contribution Activity
								</h3>
								<CommitGraph contributions={stats.contributions} />
							</CardContent>
						</Card>
					</motion.div>

					{/* Last Updated */}
					<motion.div
						className="text-center"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						viewport={{ once: true }}
					>
						<div className="flex flex-col items-center gap-2">
							<p className="text-sm text-muted-foreground">
								{formattedDate && (
									<>
										Last updated: {formattedDate}
										{isPlaceholderData && (
											<span className="ml-2 text-xs text-amber-600">
												(cached data)
											</span>
										)}
									</>
								)}
							</p>
							{error && data && (
								<p className="text-xs text-amber-600">
									Using cached data - background refresh failed
								</p>
							)}
							<Button
								onClick={handleRetry}
								disabled={isRefetching}
								variant="ghost"
								size="sm"
								className="mt-1"
							>
								{isRefetching ? (
									<>
										<Loader2 className="w-3 h-3 mr-2 animate-spin" />
										Refreshing...
									</>
								) : (
									<>
										<RefreshCw className="w-3 h-3 mr-2" />
										Refresh Data
									</>
								)}
							</Button>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
