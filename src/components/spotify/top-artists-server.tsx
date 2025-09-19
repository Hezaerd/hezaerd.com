import { Music, Users } from "lucide-react";
import Image from "next/image";
import { AnimatedFadeIn } from "@/components/ui/animated-wrapper";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { getTopArtists } from "@/lib/spotify";
import type { TimeRange } from "@/types/spotify";

interface TopArtistsServerProps {
	timeRange: TimeRange;
}

export async function TopArtistsServer({ timeRange }: TopArtistsServerProps) {
	const topArtists = await getTopArtists(timeRange);

	return (
		<div className="border-r border-border">
			{/* Header */}
			<div className="p-6 border-b border-border">
				<CardTitle className="flex items-center gap-2">
					<Users className="w-5 h-5 text-primary" />
					Top Artists
				</CardTitle>
			</div>

			{/* Content */}
			<div className="space-y-3 p-4">
				{Array.from({ length: 5 }).map((_, index) => (
					<AnimatedFadeIn key={`artist-${index + 1}`} delay={0.1 + index * 0.1}>
						{topArtists[index] ? (
							<div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
								<div className="relative">
									<Image
										src={
											topArtists[index].images[0]?.url ||
											"/placeholder-artist.png"
										}
										alt={topArtists[index].name}
										width={48}
										height={48}
										className="w-12 h-12 rounded-full object-cover"
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
										{topArtists[index].name}
									</h4>
									<p className="text-sm text-muted-foreground truncate">
										{topArtists[index].genres.slice(0, 2).join(", ")}
									</p>
								</div>
								<a
									href={topArtists[index].external_urls.spotify}
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
