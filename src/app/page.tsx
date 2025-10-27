"use client";

import { useEffect, useRef, useState } from "react";
import { Footer } from "@/components/layout/footer";
import { DotNavigation } from "@/components/navigation/dot-navigation";
import {
	ConnectSection,
	HeroSection,
	ProjectsSection,
	WorkSection,
} from "@/components/sections";

export default function Home() {
	const [activeSection, setActiveSection] = useState("intro");
	const sectionsRef = useRef<(HTMLElement | null)[]>([]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("animate-fade-in-up");
						setActiveSection(entry.target.id);
					}
				});
			},
			{ threshold: 0.3, rootMargin: "0px 0px -20% 0px" },
		);

		sectionsRef.current.forEach((section) => {
			if (section) observer.observe(section);
		});

		return () => observer.disconnect();
	}, []);

	return (
		<div className="min-h-screen bg-background text-foreground relative">
			<DotNavigation activeSection={activeSection} />

			<main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
				<HeroSection
					ref={(el) => {
						sectionsRef.current[0] = el;
					}}
				/>
				<WorkSection
					ref={(el) => {
						sectionsRef.current[1] = el;
					}}
				/>
				<ProjectsSection
					ref={(el) => {
						sectionsRef.current[2] = el;
					}}
				/>
				<ConnectSection
					ref={(el) => {
						sectionsRef.current[3] = el;
					}}
				/>

				<Footer />
			</main>
		</div>
	);
}
