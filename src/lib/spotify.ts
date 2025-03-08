import {
  ISpotifyAccessToken,
  ISpotifyAlbum,
  ISpotifyArtist,
  ISpotifyTrack,
} from "@/interfaces/spotify";

/**
 * Configuration and credentials for Spotify API
 */
const SPOTIFY_CONFIG = {
  client_id: process.env.SPOTIFY_CLIENT_ID || "",
  client_secret: process.env.SPOTIFY_CLIENT_SECRET || "",
  refresh_token: process.env.SPOTIFY_REFRESH_TOKEN || "",
};

// Validate required credentials
const validateCredentials = () => {
  const { client_id, client_secret, refresh_token } = SPOTIFY_CONFIG;

  if (!client_id || !client_secret || !refresh_token) {
    throw new Error(
      "Missing Spotify credentials. Please check your environment variables.",
    );
  }
};

// Run validation
validateCredentials();

/**
 * Basic authentication header required for token requests
 */
const basicAuth = Buffer.from(
  `${SPOTIFY_CONFIG.client_id}:${SPOTIFY_CONFIG.client_secret}`,
).toString("base64");

/**
 * API endpoints for Spotify
 */
const ENDPOINTS = {
  TOKEN: "https://accounts.spotify.com/api/token",
  CURRENT: "https://api.spotify.com/v1/me/player/currently-playing",
  RECENTLY: "https://api.spotify.com/v1/me/player/recently-played?limit=5",
  TOP_TRACKS: "https://api.spotify.com/v1/me/top/tracks?limit=5",
  TOP_ARTISTS: "https://api.spotify.com/v1/me/top/artists?limit=5",
};

/**
 * Fetches a new access token from Spotify
 * @returns Spotify access token
 * @throws Error if token fetch fails
 */
const getAccessToken = async (): Promise<string> => {
  try {
    const response = await fetch(ENDPOINTS.TOKEN, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: SPOTIFY_CONFIG.refresh_token,
      }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        `Failed to get access token: ${error.error || response.status}`,
      );
    }

    const data = await response.json();

    if (!data.access_token) {
      throw new Error("No access token returned from Spotify");
    }

    return data.access_token;
  } catch (error) {
    console.error("Spotify token error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to get Spotify access token",
    );
  }
};

/**
 * Generic fetch function for Spotify API endpoints
 * @param endpoint Spotify API endpoint to fetch from
 * @returns Parsed JSON response
 * @throws Error if fetch fails
 */
const spotifyFetch = async <T>(endpoint: string): Promise<T> => {
  try {
    const token = await getAccessToken();

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Ensure we always get fresh data
      cache: "no-store",
      next: {
        revalidate: 0, // Don't cache on the server side
      },
    });

    if (!response.ok) {
      if (response.status === 204 && endpoint === ENDPOINTS.CURRENT) {
        return null as T;
      }

      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        `Spotify API error (${response.status}): ${error.error || "Unknown"}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Spotify API fetch error (${endpoint}):`, error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch from Spotify API");
  }
};

/**
 * Fetches recently played tracks from Spotify
 * @returns Array of tracks
 */
export const recentlyPlayed = async (): Promise<ISpotifyTrack[]> => {
  try {
    const data = await spotifyFetch<{ items: { track: ISpotifyTrack }[] }>(
      ENDPOINTS.RECENTLY,
    );
    const tracks = data.items.map((item) => item.track);
    return tracks;
  } catch (error) {
    console.error("Error fetching recently played tracks:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch recently played tracks",
    );
  }
};

/**
 * Fetches the user's top tracks from Spotify
 * @returns Array of top tracks
 */
export const topTracks = async (): Promise<ISpotifyTrack[]> => {
  try {
    const data = await spotifyFetch<{ items: ISpotifyTrack[] }>(
      ENDPOINTS.TOP_TRACKS,
    );
    return data.items;
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch top tracks",
    );
  }
};

/**
 * Fetches the user's top artists from Spotify
 * @returns Array of top artists
 */
export const topArtists = async (): Promise<ISpotifyArtist[]> => {
  try {
    const data = await spotifyFetch<{ items: ISpotifyArtist[] }>(
      ENDPOINTS.TOP_ARTISTS,
    );
    return data.items;
  } catch (error) {
    console.error("Error fetching top artists:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch top artists",
    );
  }
};

/**
 * Fetches the user's currently playing track from Spotify
 * @returns Currently playing track or null if nothing is playing
 */
export const currentPlaying = async (): Promise<ISpotifyTrack | null> => {
  try {
    // If no track is playing, this will return null
    const data = await spotifyFetch<{ item: ISpotifyTrack } | null>(
      ENDPOINTS.CURRENT,
    );

    if (!data) {
      return null;
    }

    return data.item;
  } catch (error) {
    console.error("Error fetching currently playing track:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch currently playing track",
    );
  }
};
