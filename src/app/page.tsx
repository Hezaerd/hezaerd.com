import { Suspense } from "react";
import { GitHubStatsSkeleton } from "@/components/github/github-stats-skeleton";
import { Navbar } from "@/components/navbar";
import {
	About,
	Contact,
	Footer,
	GithubStats,
	Hero,
	Projects,
	Resume,
} from "@/components/sections";

export const experimental_ppr = true;

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<Hero />
			<About />
			<Projects />
			<Resume />

			<Suspense fallback={<GitHubStatsSkeleton />}>
				<GithubStats />
			</Suspense>

			<Contact />
			<Footer />
		</div>
	);
}
