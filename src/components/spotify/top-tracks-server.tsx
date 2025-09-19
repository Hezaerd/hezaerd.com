import { Music } from "lucide-react";
import Image from "next/image";
import { AnimatedFadeIn } from "@/components/ui/animated-wrapper";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { getTopTracks } from "@/lib/spotify";
import type { TimeRange } from "@/types/spotify";

interface TopTracksServerProps {
	timeRange: TimeRange;
}

export async function TopTracksServer({ timeRange }: TopTracksServerProps) {
	const topTracks = await getTopTracks(timeRange);

	return (
		<div className="border-r border-border">
			{/* Header */}
			<div className="p-6 border-b border-border">
				<CardTitle className="flex items-center gap-2">
					<Music className="w-5 h-5 text-primary" />
					Top Tracks
				</CardTitle>
			</div>

			{/* Content */}
			<div className="space-y-3 p-4">
				{Array.from({ length: 5 }).map((_, index) => (
					<AnimatedFadeIn key={`track-${index + 1}`} delay={0.2 + index * 0.1}>
						{topTracks[index] ? (
							<div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
								<div className="relative">
									<Image
										src={
											topTracks[index].album.images[0]?.url ||
											"/placeholder-album.png"
										}
										alt={topTracks[index].album.name}
										width={48}
										height={48}
										className="w-12 h-12 rounded object-cover"
									/>
									<Badge
										variant="secondary"
										className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
									>
										{index + 1}
									</Badge>
								</div>
								<div className="flex-1 min-w-0">
									<h4 className="font-medium truncate">
										{topTracks[index].name}
									</h4>
									<p className="text-sm text-muted-foreground truncate">
										{topTracks[index].artists.map((a) => a.name).join(", ")}
									</p>
								</div>
								<a
									href={topTracks[index].external_urls.spotify}
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
					</AnimatedFadeIn>
				))}
			</div>
		</div>
	);
}
