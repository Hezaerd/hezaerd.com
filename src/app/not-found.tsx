"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const VALID_ROUTES = [
	"/",
	"/spotify",
	"/api/github-stats",
	"/api/spotify/token",
] as const;

function findClosestRoute(pathname: string): string {
	if (VALID_ROUTES.includes(pathname as any)) {
		return pathname;
	}

	const segments = pathname.split("/").filter(Boolean);

	if (segments.length === 0) {
		return "/";
	}

	const firstSegment = `/${segments[0]}`;
	if (VALID_ROUTES.includes(firstSegment as any)) {
		return firstSegment;
	}

	for (let i = segments.length - 1; i >= 0; i--) {
		const parentPath = `/${segments.slice(0, i).join("/")}`;
		if (VALID_ROUTES.includes(parentPath as any)) {
			return parentPath;
		}
	}

	return "/";
}

export default function NotFound() {
	const pathname = usePathname();

	useEffect(() => {
		const closestRoute = findClosestRoute(pathname);
		window.location.replace(closestRoute);
	}, [pathname]);

	return null;
}
