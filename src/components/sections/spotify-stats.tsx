import { Music } from "lucide-react";
import { SpotifyStatsClient } from "@/components/sections/spotify-stats-client";
import { AnimatedFadeIn } from "@/components/ui/animated-wrapper";
import { SECTION_IDS } from "@/lib/sections";

export function SpotifyStats() {
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

				<SpotifyStatsClient />
			</div>
		</section>
	);
}
