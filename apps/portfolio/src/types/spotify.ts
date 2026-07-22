export type TimeRange = "short_term" | "medium_term" | "long_term";

export const TIME_RANGES = [
  {
    value: "short_term" as const,
    label: "Last 4 weeks",
    description: "Top of the month",
  },
  {
    value: "medium_term" as const,
    label: "Last 6 months",
    description: "Last 6 months",
  },
  {
    value: "long_term" as const,
    label: "All time",
    description: "Forever",
  },
] as const;

export const DEFAULT_TIME_RANGE: TimeRange = "medium_term";

export type SpotifyArtistCard = {
  id: string;
  name: string;
  url: string;
  imageUrl: string | null;
  genres: string[];
};

export type SpotifyTrackCard = {
  id: string;
  name: string;
  url: string;
  imageUrl: string | null;
  artists: string;
  albumName: string;
};

export type SpotifyRecentItem = {
  id: string;
  name: string;
  url: string;
  imageUrl: string | null;
  artists: string;
  playedAt: string;
};

export type SpotifyNowPlaying = SpotifyTrackCard & {
  isPlaying: boolean;
};
