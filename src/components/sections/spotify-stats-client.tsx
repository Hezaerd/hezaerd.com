"use client";

import { Clock, Music, Users } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { AnimatedFadeIn } from "@/components/ui/animated-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SECTION_IDS } from "@/lib/sections";
import type { SpotifyStats, TimeRange } from "@/types/spotify";

const TIME_RANGES: { value: TimeRange; label: string; description: string }[] =
	[
		{
			value: "short_term",
			label: "Last 4 weeks",
			description: "Top of the month",
		},
		{
			value: "medium_term",
			label: "Last 6 months",
			description: "Last 6 months",
		},
		{ value: "long_term", label: "All time", description: "Forever" },
	];

export function SpotifyStatsClient() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [stats, setStats] = useState<SpotifyStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Initialize time range from URL parameters or default
	const urlTimeRange = searchParams.get("timeRange") as TimeRange;
	const initialTimeRange =
		urlTimeRange &&
		["short_term", "medium_term", "long_term"].includes(urlTimeRange)
			? urlTimeRange
			: "medium_term";
	const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);

	const fetchSpotifyStats = useCallback(async (range: TimeRange) => {
		setLoading(true);
		setError(null);

		try {
			const [artistsRes, tracksRes, recentRes] = await Promise.all([
				fetch(`/api/spotify/top-artists?time_range=${range}&limit=10`),
				fetch(`/api/spotify/top-tracks?time_range=${range}&limit=10`),
				fetch(`/api/spotify/recently-played?limit=20`),
			]);

			if (!artistsRes.ok || !tracksRes.ok || !recentRes.ok) {
				throw new Error("Failed to fetch Spotify data");
			}

			const [artistsData, tracksData, recentData] = await Promise.all([
				artistsRes.json(),
				tracksRes.json(),
				recentRes.json(),
			]);

			setStats({
				topArtists: artistsData.items || [],
				topTracks: tracksData.items || [],
				recentlyPlayed: recentData.items || [],
				timeRange: range,
			});
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to load Spotify data",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	// Update time range when URL parameters change
	useEffect(() => {
		const urlTimeRange = searchParams.get("timeRange") as TimeRange;
		if (
			urlTimeRange &&
			["short_term", "medium_term", "long_term"].includes(urlTimeRange) &&
			urlTimeRange !== timeRange
		) {
			setTimeRange(urlTimeRange);
		}
	}, [searchParams, timeRange]);

	useEffect(() => {
		fetchSpotifyStats(timeRange);
	}, [timeRange, fetchSpotifyStats]);

	const handleTimeRangeChange = (newTimeRange: TimeRange) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("timeRange", newTimeRange);
		router.push(`/?${params.toString()}`, { scroll: false });
	};

	if (loading) {
		return (
			<div className="space-y-8">
				<div className="flex justify-center gap-2">
					{TIME_RANGES.map((range) => (
						<div
							key={range.value}
							className="h-10 w-24 bg-muted animate-pulse rounded-md"
						/>
					))}
				</div>
				<div className="grid md:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader>
								<div className="h-6 bg-muted rounded w-1/2" />
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{[1, 2, 3].map((j) => (
										<div key={j} className="flex items-center gap-3">
											<div className="w-12 h-12 bg-muted rounded-full" />
											<div className="flex-1 space-y-2">
												<div className="h-4 bg-muted rounded w-3/4" />
												<div className="h-3 bg-muted rounded w-1/2" />
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Card className="border-red-500/20 bg-red-500/10">
				<CardContent className="p-6 text-center">
					<p className="text-red-400 font-medium mb-4">Error: {error}</p>
					<Button
						onClick={() => fetchSpotifyStats(timeRange)}
						variant="outline"
					>
						Try Again
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (!stats) return null;

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
					{/* Time Range Selector */}
					<AnimatedFadeIn className="flex flex-wrap justify-center gap-2">
						{TIME_RANGES.map((range) => (
							<Button
								key={range.value}
								variant={timeRange === range.value ? "default" : "outline"}
								onClick={() => handleTimeRangeChange(range.value)}
								className="flex flex-col items-center gap-1 h-auto py-3 px-4"
							>
								<span className="font-medium">{range.label}</span>
								<span className="text-xs opacity-70">{range.description}</span>
							</Button>
						))}
					</AnimatedFadeIn>

					{/* Stats Table */}
					<Card>
						<CardContent className="p-0">
							<div className="grid grid-cols-3">
								{/* Headers */}
								<div className="border-r border-border">
									<div className="p-6 border-b border-border">
										<CardTitle className="flex items-center gap-2">
											<Users className="w-5 h-5 text-primary" />
											Top Artists
										</CardTitle>
									</div>
								</div>
								<div className="border-r border-border">
									<div className="p-6 border-b border-border">
										<CardTitle className="flex items-center gap-2">
											<Music className="w-5 h-5 text-primary" />
											Top Tracks
										</CardTitle>
									</div>
								</div>
								<div>
									<div className="p-6 border-b border-border">
										<CardTitle className="flex items-center gap-2">
											<Clock className="w-5 h-5 text-primary" />
											Recently Played
										</CardTitle>
									</div>
								</div>

								{/* Rows */}
								{Array.from({ length: 5 }).map((_, rowIndex) => (
									<React.Fragment key={`spotify-stats-row-${rowIndex + 1}`}>
										{/* Top Artists Row */}
										<div className="border-r border-border">
											<AnimatedFadeIn delay={0.1 + rowIndex * 0.1}>
												<div className="p-4 border-b border-border last:border-b-0">
													{stats.topArtists[rowIndex] ? (
														<div className="flex items-center gap-3">
															<div className="relative">
																<Image
																	src={
																		stats.topArtists[rowIndex].images[0]?.url ||
																		"/placeholder-artist.png"
																	}
																	alt={stats.topArtists[rowIndex].name}
																	width={48}
																	height={48}
																	className="w-12 h-12 rounded-full object-cover"
																/>
																<Badge
																	variant="secondary"
																	className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
																>
																	{rowIndex + 1}
																</Badge>
															</div>
															<div className="flex-1 min-w-0">
																<h4 className="font-medium truncate">
																	{stats.topArtists[rowIndex].name}
																</h4>
																<p className="text-sm text-muted-foreground truncate">
																	{stats.topArtists[rowIndex].genres
																		.slice(0, 2)
																		.join(", ")}
																</p>
															</div>
															<a
																href={
																	stats.topArtists[rowIndex].external_urls
																		.spotify
																}
																target="_blank"
																rel="noopener noreferrer"
																className="text-primary hover:text-primary/80 transition-colors"
															>
																<Music className="w-4 h-4" />
															</a>
														</div>
													) : (
														<div className="h-16 flex items-center justify-center text-muted-foreground">
															—
														</div>
													)}
												</div>
											</AnimatedFadeIn>
										</div>

										{/* Top Tracks Row */}
										<div className="border-r border-border">
											<AnimatedFadeIn delay={0.2 + rowIndex * 0.1}>
												<div className="p-4 border-b border-border last:border-b-0">
													{stats.topTracks[rowIndex] ? (
														<div className="flex items-center gap-3">
															<div className="relative">
																<Image
																	src={
																		stats.topTracks[rowIndex].album.images[0]
																			?.url || "/placeholder-album.png"
																	}
																	alt={stats.topTracks[rowIndex].album.name}
																	width={48}
																	height={48}
																	className="w-12 h-12 rounded object-cover"
																/>
																<Badge
																	variant="secondary"
																	className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
																>
																	{rowIndex + 1}
																</Badge>
															</div>
															<div className="flex-1 min-w-0">
																<h4 className="font-medium truncate">
																	{stats.topTracks[rowIndex].name}
																</h4>
																<p className="text-sm text-muted-foreground truncate">
																	{stats.topTracks[rowIndex].artists
																		.map((a) => a.name)
																		.join(", ")}
																</p>
															</div>
															<a
																href={
																	stats.topTracks[rowIndex].external_urls
																		.spotify
																}
																target="_blank"
																rel="noopener noreferrer"
																className="text-primary hover:text-primary/80 transition-colors"
															>
																<Music className="w-4 h-4" />
															</a>
														</div>
													) : (
														<div className="h-16 flex items-center justify-center text-muted-foreground">
															—
														</div>
													)}
												</div>
											</AnimatedFadeIn>
										</div>

										{/* Recently Played Row */}
										<div>
											<AnimatedFadeIn delay={0.3 + rowIndex * 0.1}>
												<div className="p-4 border-b border-border last:border-b-0">
													{stats.recentlyPlayed[rowIndex] ? (
														<div className="flex items-center gap-3">
															<Image
																src={
																	stats.recentlyPlayed[rowIndex].track.album
																		.images[0]?.url || "/placeholder-album.png"
																}
																alt={
																	stats.recentlyPlayed[rowIndex].track.album
																		.name
																}
																width={48}
																height={48}
																className="w-12 h-12 rounded object-cover"
															/>
															<div className="flex-1 min-w-0">
																<h4 className="font-medium truncate">
																	{stats.recentlyPlayed[rowIndex].track.name}
																</h4>
																<p className="text-sm text-muted-foreground truncate">
																	{stats.recentlyPlayed[rowIndex].track.artists
																		.map((a) => a.name)
																		.join(", ")}
																</p>
																<p className="text-xs text-muted-foreground">
																	{new Date(
																		stats.recentlyPlayed[rowIndex].played_at,
																	).toLocaleDateString()}
																</p>
															</div>
															<a
																href={
																	stats.recentlyPlayed[rowIndex].track
																		.external_urls.spotify
																}
																target="_blank"
																rel="noopener noreferrer"
																className="text-primary hover:text-primary/80 transition-colors"
															>
																<Music className="w-4 h-4" />
															</a>
														</div>
													) : (
														<div className="h-16 flex items-center justify-center text-muted-foreground">
															—
														</div>
													)}
												</div>
											</AnimatedFadeIn>
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
