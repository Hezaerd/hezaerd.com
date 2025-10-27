"use client";

import { SECTION_NAMES } from "@/data/constants";

interface DotNavigationProps {
	activeSection: string;
}

export function DotNavigation({ activeSection }: DotNavigationProps) {
	const handleScroll = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
			<div className="flex flex-col gap-4">
				{SECTION_NAMES.map((section) => (
					<button
						key={section}
						onClick={() => handleScroll(section)}
						className={`w-2 h-8 rounded-full transition-all duration-500 ${
							activeSection === section
								? "bg-foreground"
								: "bg-muted-foreground/30 hover:bg-muted-foreground/60"
						}`}
						aria-label={`Navigate to ${section}`}
					/>
				))}
			</div>
		</nav>
	);
}
