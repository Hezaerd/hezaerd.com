"use client";

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

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<Hero />
			<About />
			<Projects />
			<Resume />
			<GithubStats />
			<Contact />
			<Footer />
		</div>
	);
}
