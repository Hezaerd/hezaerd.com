import { queryOptions } from "@tanstack/react-query";

import {
  getCurrentlyPlayingFn,
  getRecentlyPlayedFn,
  getTopArtistsFn,
  getTopTracksFn,
} from "@/server/spotify";
import type { TimeRange } from "@/types/spotify";

export const currentlyPlayingQueryOptions = queryOptions({
  queryKey: ["spotify", "now-playing"] as const,
  queryFn: () => getCurrentlyPlayingFn(),
  staleTime: 0,
  refetchInterval: 30_000,
});

export function topArtistsQueryOptions(timeRange: TimeRange) {
  return queryOptions({
    queryKey: ["spotify", "top-artists", timeRange] as const,
    queryFn: () => getTopArtistsFn({ data: { timeRange } }),
    staleTime: 3_600_000,
  });
}

export function topTracksQueryOptions(timeRange: TimeRange) {
  return queryOptions({
    queryKey: ["spotify", "top-tracks", timeRange] as const,
    queryFn: () => getTopTracksFn({ data: { timeRange } }),
    staleTime: 3_600_000,
  });
}

export const recentlyPlayedQueryOptions = queryOptions({
  queryKey: ["spotify", "recently-played"] as const,
  queryFn: () => getRecentlyPlayedFn(),
  staleTime: 300_000,
});
