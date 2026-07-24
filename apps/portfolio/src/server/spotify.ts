import type { TimeRange } from "@/types/spotify";

import { createServerFn } from "@tanstack/react-start";

import { getCurrentlyPlaying, getRecentlyPlayed, getTopArtists, getTopTracks } from "@/lib/spotify";

const TIME_RANGES = new Set<TimeRange>(["short_term", "medium_term", "long_term"]);

function parseTimeRange(data: { timeRange: TimeRange }): { timeRange: TimeRange } {
  if (!TIME_RANGES.has(data.timeRange)) {
    throw new Error("Invalid Spotify time range");
  }

  return { timeRange: data.timeRange };
}

export const getCurrentlyPlayingFn = createServerFn({ method: "GET" }).handler(async () => {
  return getCurrentlyPlaying();
});

export const getTopArtistsFn = createServerFn({ method: "GET" })
  .validator(parseTimeRange)
  .handler(async ({ data }) => {
    return getTopArtists(data.timeRange);
  });

export const getTopTracksFn = createServerFn({ method: "GET" })
  .validator(parseTimeRange)
  .handler(async ({ data }) => {
    return getTopTracks(data.timeRange);
  });

export const getRecentlyPlayedFn = createServerFn({ method: "GET" }).handler(async () => {
  return getRecentlyPlayed();
});
