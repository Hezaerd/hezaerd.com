"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface AnimatedSectionProps {
	children: ReactNode;
	className?: string;
	delay?: number;
	direction?: "up" | "down" | "left" | "right";
	distance?: number;
}

export function AnimatedFadeIn({
	children,
	className = "",
	delay = 0,
	direction = "up",
	distance = 30,
}: AnimatedSectionProps) {
	const getInitialPosition = () => {
		switch (direction) {
			case "up":
				return { opacity: 0, y: distance };
			case "down":
				return { opacity: 0, y: -distance };
			case "left":
				return { opacity: 0, x: distance };
			case "right":
				return { opacity: 0, x: -distance };
			default:
				return { opacity: 0, y: distance };
		}
	};

	const getFinalPosition = () => {
		switch (direction) {
			case "up":
			case "down":
				return { opacity: 1, y: 0 };
			case "left":
			case "right":
				return { opacity: 1, x: 0 };
			default:
				return { opacity: 1, y: 0 };
		}
	};

	return (
		<motion.div
			className={className}
			initial={getInitialPosition()}
			whileInView={getFinalPosition()}
			transition={{ duration: 0.6, delay }}
			viewport={{ once: true }}
		>
			{children}
		</motion.div>
	);
}
