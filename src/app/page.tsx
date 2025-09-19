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
	SpotifyStats,
} from "@/components/sections";
import { SECTION_IDS } from "@/lib/sections";

export const experimental_ppr = true;

interface HomeProps {
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
	const resolvedSearchParams = await searchParams;

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

			<SpotifyStats searchParams={resolvedSearchParams} />

			<Footer />
		</div>
	);
}
