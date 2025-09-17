"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";

interface AnalyticsProviderProps {
	children: ReactNode;
	debug?: boolean;
}

export function AnalyticsProvider({
	children,
	debug = false,
}: AnalyticsProviderProps) {
	// Only load analytics in production, unless debug mode is enabled
	const shouldLoadAnalytics = process.env.NODE_ENV === "production" || debug;

	return (
		<>
			{children}
			{shouldLoadAnalytics && (
				<>
					<Analytics debug={debug} />
					<SpeedInsights debug={debug} />
				</>
			)}
		</>
	);
}
