import { Suspense } from "react";
import { GitHubStatsSkeleton } from "@/components/github/github-stats-skeleton";
import { Navbar } from "@/components/navbar";
import {
	About,
	Footer,
	GithubStats,
	Hero,
	Projects,
	Resume,
} from "@/components/sections";
import { SpotifyStatsClient } from "@/components/sections/spotify-stats-client";
import { BackToTop } from "@/components/ui/back-to-top";
import { SECTION_IDS } from "@/lib/sections";

export const experimental_ppr = true;

export default async function Home() {

	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<Hero />
			<About />
			<Projects />
			<Resume />

			<Suspense fallback={<GitHubStatsSkeleton />}>
				<GithubStats id={SECTION_IDS.githubStats} />
			</Suspense>

			<SpotifyStatsClient />

			<Footer />
			<BackToTop />
		</div>
	);
}
