import { Music } from "lucide-react";
import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export function SpotifyStatsSkeleton() {
	return (
		<section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
			<div className="max-w-7xl mx-auto">
				<div className="text-3xl sm:text-4xl font-bold text-center text-card-foreground mb-12 flex items-center justify-center gap-2">
					<Music className="w-7 h-7 text-primary" />
					My Music Taste
				</div>

				<div className="space-y-8">
					{/* Time Range Selector Skeleton */}
					<div className="flex flex-wrap justify-center gap-2">
						<div className="h-12 w-24 bg-muted animate-pulse rounded" />
						<div className="h-12 w-24 bg-muted animate-pulse rounded" />
						<div className="h-12 w-24 bg-muted animate-pulse rounded" />
					</div>

					{/* Stats Table Skeleton */}
					<Card>
						<CardContent className="p-0">
							<div className="grid grid-cols-3">
								{/* Headers */}
								<div className="border-r border-border">
									<div className="p-6 border-b border-border">
										<CardTitle className="flex items-center gap-2">
											<div className="w-5 h-5 bg-muted rounded animate-pulse" />
											<div className="h-6 w-24 bg-muted rounded animate-pulse" />
										</CardTitle>
									</div>
								</div>
								<div className="border-r border-border">
									<div className="p-6 border-b border-border">
										<CardTitle className="flex items-center gap-2">
											<div className="w-5 h-5 bg-muted rounded animate-pulse" />
											<div className="h-6 w-20 bg-muted rounded animate-pulse" />
										</CardTitle>
									</div>
								</div>
								<div>
									<div className="p-6 border-b border-border">
										<CardTitle className="flex items-center gap-2">
											<div className="w-5 h-5 bg-muted rounded animate-pulse" />
											<div className="h-6 w-28 bg-muted rounded animate-pulse" />
										</CardTitle>
									</div>
								</div>

								{/* Rows */}
								{[...Array(5)].map((_, rowIndex) => (
									<React.Fragment key={`spotify-stats-row-${rowIndex + 1}`}>
										{/* Top Artists Row */}
										<div className="border-r border-border">
											<div className="p-4 border-b border-border last:border-b-0">
												<div className="flex items-center gap-3">
													<div className="relative">
														<div className="w-12 h-12 bg-muted animate-pulse rounded-full" />
														<div className="absolute -top-1 -right-1 w-5 h-5 bg-muted animate-pulse rounded" />
													</div>
													<div className="flex-1 space-y-2">
														<div className="h-4 w-32 bg-muted rounded animate-pulse" />
														<div className="h-3 w-24 bg-muted rounded animate-pulse" />
													</div>
													<div className="w-4 h-4 bg-muted animate-pulse rounded" />
												</div>
											</div>
										</div>

										{/* Top Tracks Row */}
										<div className="border-r border-border">
											<div className="p-4 border-b border-border last:border-b-0">
												<div className="flex items-center gap-3">
													<div className="relative">
														<div className="w-12 h-12 bg-muted animate-pulse rounded" />
														<div className="absolute -top-1 -right-1 w-5 h-5 bg-muted animate-pulse rounded" />
													</div>
													<div className="flex-1 space-y-2">
														<div className="h-4 w-32 bg-muted rounded animate-pulse" />
														<div className="h-3 w-24 bg-muted rounded animate-pulse" />
													</div>
													<div className="w-4 h-4 bg-muted animate-pulse rounded" />
												</div>
											</div>
										</div>

										{/* Recently Played Row */}
										<div>
											<div className="p-4 border-b border-border last:border-b-0">
												<div className="flex items-center gap-3">
													<div className="w-12 h-12 bg-muted animate-pulse rounded" />
													<div className="flex-1 space-y-2">
														<div className="h-4 w-32 bg-muted rounded animate-pulse" />
														<div className="h-3 w-24 bg-muted rounded animate-pulse" />
														<div className="h-3 w-16 bg-muted rounded animate-pulse" />
													</div>
													<div className="w-4 h-4 bg-muted animate-pulse rounded" />
												</div>
											</div>
										</div>
									</React.Fragment>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
