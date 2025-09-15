import { useQuery } from "@tanstack/react-query";
import type { GitHubStatsResponse } from "@/types/github";

const GITHUB_STATS_QUERY_KEY = ["github-stats"] as const;

async function fetchGitHubStats(): Promise<GitHubStatsResponse> {
	const response = await fetch("/api/github-stats", {
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data: GitHubStatsResponse = await response.json();

	if (!data.success) {
		throw new Error(data.error || "Failed to fetch GitHub stats");
	}

	return data;
}

export function useGitHubStats() {
	return useQuery({
		queryKey: GITHUB_STATS_QUERY_KEY,
		queryFn: fetchGitHubStats,
		staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		refetchOnWindowFocus: false,
		refetchOnMount: false, // Don't refetch if we have cached data
		refetchOnReconnect: "always",
		// Enable background refetching for stale data
		refetchInterval: 10 * 60 * 1000, // Background refresh every 10 minutes
		refetchIntervalInBackground: false, // Only when tab is active
		// Use placeholderData to prevent loading states with cached data
		placeholderData: (previousData) => previousData,
		networkMode: "offlineFirst", // Serve from cache first, then fetch
	});
}
