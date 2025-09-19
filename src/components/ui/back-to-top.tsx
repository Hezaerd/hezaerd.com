"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function BackToTop() {
	const [isVisible, setIsVisible] = useState(false);
	const [isScrolling, setIsScrolling] = useState(false);

	useEffect(() => {
		let scrollTimeout: NodeJS.Timeout;

		const handleScroll = () => {
			const scrollTop =
				window.pageYOffset || document.documentElement.scrollTop;

			// Show button when scrolled down 100px or more
			setIsVisible(scrollTop > 100);

			// Hide button during scroll
			setIsScrolling(true);

			// Clear previous timeout and set new one
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				setIsScrolling(false);
			}, 150); // Show button again 150ms after scroll stops
		};

		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
			clearTimeout(scrollTimeout);
		};
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	if (!isVisible) {
		return null;
	}

	return (
		<button
			type="button"
			onClick={scrollToTop}
			className={cn(
				"fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
				"opacity-100 translate-y-0",
				isScrolling && "opacity-0 translate-y-2 pointer-events-none",
			)}
			aria-label="Back to top"
			title="Back to top"
		>
			<ChevronUp className="h-5 w-5" />
		</button>
	);
}
