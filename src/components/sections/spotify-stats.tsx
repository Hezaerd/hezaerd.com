import { Music } from "lucide-react";
import React, { Suspense } from "react";
import { RecentlyPlayedServer } from "@/components/spotify/recently-played-server";
import { SpotifyTimeRangeSelector } from "@/components/spotify/spotify-time-range-selector";
import { TopArtistsServer } from "@/components/spotify/top-artists-server";
import { TopTracksServer } from "@/components/spotify/top-tracks-server";
import { AnimatedFadeIn } from "@/components/ui/animated-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { SECTION_IDS } from "@/lib/sections";
import type { TimeRange } from "@/types/spotify";

interface SpotifyStatsProps {
	searchParams?: { timeRange?: string };
}

function SpotifyStatsLoading() {
	return (
		<div className="grid grid-cols-3">
			{/* Headers */}
			<div className="border-r border-border">
				<div className="p-6 border-b border-border">
					<div className="h-6 bg-muted animate-pulse rounded w-32" />
				</div>
			</div>
			<div className="border-r border-border">
				<div className="p-6 border-b border-border">
					<div className="h-6 bg-muted animate-pulse rounded w-32" />
				</div>
			</div>
			<div>
				<div className="p-6 border-b border-border">
					<div className="h-6 bg-muted animate-pulse rounded w-36" />
				</div>
			</div>

			{/* Loading Rows */}
			{Array.from({ length: 5 }).map((_, rowIndex) => (
				<React.Fragment key={`loading-row-${rowIndex + 1}`}>
					<div className="border-r border-border">
						<div className="p-4 border-b border-border last:border-b-0">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-muted animate-pulse rounded-full" />
								<div className="flex-1 space-y-2">
									<div className="h-4 bg-muted animate-pulse rounded w-3/4" />
									<div className="h-3 bg-muted animate-pulse rounded w-1/2" />
								</div>
							</div>
						</div>
					</div>
					<div className="border-r border-border">
						<div className="p-4 border-b border-border last:border-b-0">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-muted animate-pulse rounded" />
								<div className="flex-1 space-y-2">
									<div className="h-4 bg-muted animate-pulse rounded w-3/4" />
									<div className="h-3 bg-muted animate-pulse rounded w-1/2" />
								</div>
							</div>
						</div>
					</div>
					<div>
						<div className="p-4 border-b border-border last:border-b-0">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-muted animate-pulse rounded" />
								<div className="flex-1 space-y-2">
									<div className="h-4 bg-muted animate-pulse rounded w-3/4" />
									<div className="h-3 bg-muted animate-pulse rounded w-1/2" />
									<div className="h-3 bg-muted animate-pulse rounded w-1/3" />
								</div>
							</div>
						</div>
					</div>
				</React.Fragment>
			))}
		</div>
	);
}

export function SpotifyStats({ searchParams }: SpotifyStatsProps) {
	const timeRange = (searchParams?.timeRange as TimeRange) || "medium_term";

	return (
		<section
			id={SECTION_IDS.spotifyStats}
			className="py-16 px-4 sm:px-6 lg:px-8 bg-card"
		>
			<div className="max-w-7xl mx-auto">
				<AnimatedFadeIn className="text-3xl sm:text-4xl font-bold text-center text-card-foreground mb-12 flex items-center justify-center gap-2">
					<Music className="w-7 h-7 text-primary" />
					My Music Taste
				</AnimatedFadeIn>

				<div className="space-y-8">
					{/* Time Range Selector - Client Component */}
					<SpotifyTimeRangeSelector currentTimeRange={timeRange} />

					{/* Server Components Table */}
					<Card>
						<CardContent className="p-0">
							<Suspense fallback={<SpotifyStatsLoading />}>
								<div className="grid grid-cols-3">
									<TopArtistsServer timeRange={timeRange} />
									<TopTracksServer timeRange={timeRange} />
									<RecentlyPlayedServer />
								</div>
							</Suspense>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
