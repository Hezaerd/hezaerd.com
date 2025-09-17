import { Github } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function GitHubStatsSkeleton() {
	return (
		<section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
			<div className="max-w-7xl mx-auto">
				<h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12 flex items-center justify-center gap-2">
					<Github className="w-7 h-7 text-primary" /> GitHub Stats
				</h2>

				<div className="space-y-8">
					{/* Stats Overview Skeleton */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{[...Array(3)].map((_, i) => (
							<Card key={i} className="text-center">
								<CardContent className="p-6">
									<div className="flex items-center justify-center mb-2">
										<div className="w-5 h-5 bg-muted rounded mr-2 animate-pulse" />
										<div className="h-8 w-16 bg-muted rounded animate-pulse" />
									</div>
									<div className="h-4 w-20 bg-muted rounded mx-auto animate-pulse" />
								</CardContent>
							</Card>
						))}
					</div>

					{/* Language Stats Skeleton */}
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center mb-4">
								<div className="w-5 h-5 bg-muted rounded mr-2 animate-pulse" />
								<div className="h-6 w-32 bg-muted rounded animate-pulse" />
							</div>
							<div className="space-y-3">
								{[...Array(5)].map((_, i) => (
									<div key={i} className="flex items-center justify-between">
										<div className="flex items-center space-x-3">
											<div className="w-3 h-3 bg-muted rounded-full animate-pulse" />
											<div className="h-4 w-20 bg-muted rounded animate-pulse" />
										</div>
										<div className="text-right space-y-1">
											<div className="h-4 w-12 bg-muted rounded animate-pulse" />
											<div className="h-3 w-16 bg-muted rounded animate-pulse" />
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Repositories Skeleton */}
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center mb-4">
								<div className="w-5 h-5 bg-muted rounded mr-2 animate-pulse" />
								<div className="h-6 w-40 bg-muted rounded animate-pulse" />
							</div>
							<div className="space-y-4">
								{[...Array(4)].map((_, i) => (
									<div key={i} className="border border-border rounded-lg p-4">
										<div className="flex items-start justify-between mb-3">
											<div className="flex-1">
												<div className="flex items-center space-x-2 mb-2">
													<div className="h-5 w-32 bg-muted rounded animate-pulse" />
													<div className="h-5 w-16 bg-muted rounded animate-pulse" />
												</div>
												<div className="h-4 w-full bg-muted rounded mb-3 animate-pulse" />
												<div className="flex items-center space-x-4">
													<div className="h-3 w-12 bg-muted rounded animate-pulse" />
													<div className="h-3 w-12 bg-muted rounded animate-pulse" />
													<div className="h-3 w-24 bg-muted rounded animate-pulse" />
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Contribution Graph Skeleton */}
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center mb-6">
								<div className="w-5 h-5 bg-muted rounded mr-2 animate-pulse" />
								<div className="h-6 w-40 bg-muted rounded animate-pulse" />
							</div>
							<div className="h-32 w-full bg-muted rounded animate-pulse" />
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
