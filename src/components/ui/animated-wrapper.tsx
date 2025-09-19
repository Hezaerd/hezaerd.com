"use client";

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
	return <div className={className}>{children}</div>;
}
