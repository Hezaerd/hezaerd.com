import { Clock, Music } from "lucide-react";
import Image from "next/image";
import { AnimatedFadeIn } from "@/components/ui/animated-wrapper";
import { CardTitle } from "@/components/ui/card";
import { getRecentlyPlayed } from "@/lib/spotify";

export async function RecentlyPlayedServer() {
	const recentlyPlayed = await getRecentlyPlayed();

	return (
		<div>
			{/* Header */}
			<div className="p-6 border-b border-border">
				<CardTitle className="flex items-center gap-2">
					<Clock className="w-5 h-5 text-primary" />
					Recently Played
				</CardTitle>
			</div>

			{/* Content */}
			<div className="space-y-3 p-4">
				{Array.from({ length: 5 }).map((_, index) => (
					<AnimatedFadeIn key={`recent-${index + 1}`} delay={0.3 + index * 0.1}>
						{recentlyPlayed[index] ? (
							<div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
								<Image
									src={
										recentlyPlayed[index].track.album.images[0]?.url ||
										"/placeholder-album.png"
									}
									alt={recentlyPlayed[index].track.album.name}
									width={48}
									height={48}
									className="w-12 h-12 rounded object-cover"
								/>
								<div className="flex-1 min-w-0">
									<h4 className="font-medium truncate">
										{recentlyPlayed[index].track.name}
									</h4>
									<p className="text-sm text-muted-foreground truncate">
										{recentlyPlayed[index].track.artists
											.map((a) => a.name)
											.join(", ")}
									</p>
									<p className="text-xs text-muted-foreground">
										{new Date(
											recentlyPlayed[index].played_at,
										).toLocaleDateString()}
									</p>
								</div>
								<a
									href={recentlyPlayed[index].track.external_urls.spotify}
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
