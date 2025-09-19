"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AnimatedFadeIn } from "@/components/ui/animated-wrapper";
import { Button } from "@/components/ui/button";
import type { TimeRange } from "@/types/spotify";

const TIME_RANGES: { value: TimeRange; label: string; description: string }[] = [
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

interface SpotifyTimeRangeSelectorProps {
	currentTimeRange: TimeRange;
}

export function SpotifyTimeRangeSelector({ currentTimeRange }: SpotifyTimeRangeSelectorProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleTimeRangeChange = (timeRange: TimeRange) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("timeRange", timeRange);
		router.push(`#spotify-stats?${params.toString()}`, { scroll: false });
	};

	return (
		<AnimatedFadeIn className="flex flex-wrap justify-center gap-2">
			{TIME_RANGES.map((range) => (
				<Button
					key={range.value}
					variant={currentTimeRange === range.value ? "default" : "outline"}
					onClick={() => handleTimeRangeChange(range.value)}
					className="flex flex-col items-center gap-1 h-auto py-3 px-4"
				>
					<span className="font-medium">{range.label}</span>
					<span className="text-xs opacity-70">{range.description}</span>
				</Button>
			))}
		</AnimatedFadeIn>
	);
}
