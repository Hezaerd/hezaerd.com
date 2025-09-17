"use client";

import { Book, Code, ExternalLink, GitFork, Star } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { GitHubStats } from "@/types/github";

interface GitHubStatsDisplayProps {
	stats: GitHubStats;
	className?: string;
}

export function GitHubStatsDisplay({
	stats,
	className = "",
}: GitHubStatsDisplayProps) {
	const { user, totalStars, favoriteLanguage, topRepositories, languageStats } =
		stats;

	// Get top 5 languages for display
	const topLanguages = Object.entries(languageStats)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5);

	const formatBytes = (bytes: number): string => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
	};

	const getLanguageColor = (language: string): string => {
		const colors: { [key: string]: string } = {
			JavaScript: "bg-yellow-400",
			TypeScript: "bg-blue-400",
			Python: "bg-green-400",
			Java: "bg-orange-400",
			"C++": "bg-purple-400",
			C: "bg-gray-400",
			"C#": "bg-green-500",
			Go: "bg-cyan-400",
			Rust: "bg-orange-600",
			PHP: "bg-indigo-400",
			Ruby: "bg-red-400",
			Swift: "bg-orange-500",
			Kotlin: "bg-purple-500",
			Dart: "bg-blue-500",
			HTML: "bg-orange-300",
			CSS: "bg-blue-300",
			SCSS: "bg-pink-400",
			Vue: "bg-green-400",
			React: "bg-blue-400",
		};
		return colors[language] || "bg-gray-400";
	};

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Overview Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					<Card className="text-center">
						<CardContent className="p-6">
							<div className="flex items-center justify-center mb-2">
								<Star className="w-5 h-5 text-yellow-500 mr-2" />
								<span className="text-2xl font-bold text-foreground">
									{totalStars.toLocaleString()}
								</span>
							</div>
							<p className="text-sm text-muted-foreground">Total Stars</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<Card className="text-center">
						<CardContent className="p-6">
							<div className="flex items-center justify-center mb-2">
								<Book className="w-5 h-5 text-blue-500 mr-2" />
								<span className="text-2xl font-bold text-foreground">
									{user.public_repos.toLocaleString()}
								</span>
							</div>
							<p className="text-sm text-muted-foreground">Public Repos</p>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					<Card className="text-center">
						<CardContent className="p-6">
							<div className="flex items-center justify-center mb-2">
								<Code className="w-5 h-5 text-green-500 mr-2" />
								<span className="text-lg font-bold text-foreground">
									{favoriteLanguage || "N/A"}
								</span>
							</div>
							<p className="text-sm text-muted-foreground">Top Language</p>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Language Breakdown */}
			{topLanguages.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
				>
					<Card>
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold mb-4 flex items-center">
								<Code className="w-5 h-5 mr-2" />
								Language Usage
							</h3>
							<div className="space-y-3">
								{topLanguages.map(([language, bytes], index) => {
									const percentage = (
										(bytes / topLanguages[0][1]) *
										100
									).toFixed(1);
									return (
										<motion.div
											key={language}
											className="flex items-center justify-between"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.3, delay: 0.1 * index }}
										>
											<div className="flex items-center space-x-3">
												<div
													className={`w-3 h-3 rounded-full ${getLanguageColor(language)}`}
												/>
												<span className="text-sm font-medium">{language}</span>
											</div>
											<div className="text-right">
												<div className="text-sm font-medium">{percentage}%</div>
												<div className="text-xs text-muted-foreground">
													{formatBytes(bytes)}
												</div>
											</div>
										</motion.div>
									);
								})}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}

			{/* Top Repositories */}
			{topRepositories.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.5 }}
				>
					<Card>
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold mb-4 flex items-center">
								<Book className="w-5 h-5 mr-2" />
								Latest Repositories
							</h3>
							<div className="space-y-4">
								{topRepositories.slice(0, 4).map((repo, index) => (
									<motion.div
										key={repo.id}
										className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3, delay: 0.1 * index }}
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center space-x-2 mb-2">
													<a
														href={repo.html_url}
														target="_blank"
														rel="noopener noreferrer"
														className="text-base font-semibold text-primary hover:underline flex items-center"
													>
														{repo.full_name.toLowerCase()}
														<ExternalLink className="w-3 h-3 ml-1" />
													</a>
													{repo.language && (
														<Badge variant="secondary" className="text-xs">
															{repo.language}
														</Badge>
													)}
												</div>
												{repo.description && (
													<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
														{repo.description}
													</p>
												)}
												<div className="flex items-center space-x-4 text-xs text-muted-foreground">
													<div className="flex items-center">
														<Star className="w-3 h-3 mr-1" />
														{repo.stargazers_count}
													</div>
													<div className="flex items-center">
														<GitFork className="w-3 h-3 mr-1" />
														{repo.forks_count}
													</div>
													<div>
														Last push{" "}
														{new Date(repo.pushed_at).toLocaleDateString()}
													</div>
												</div>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</div>
	);
}
