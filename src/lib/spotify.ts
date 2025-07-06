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

// Simple in-memory cache for access token
let tokenCache: { token: string; expiresAt: number } | null = null;
const TOKEN_CACHE_DURATION = 50 * 60 * 1000; // 50 minutes (tokens expire in 1 hour)

// Request throttling to prevent spam
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // Minimum 100ms between requests

/**
 * Validates required Spotify credentials
 * @throws Error if any required credentials are missing
 */
const validateCredentials = () => {
  const { client_id, client_secret, refresh_token } = SPOTIFY_CONFIG;

  const missingCredentials = [];
  if (!client_id) missingCredentials.push("SPOTIFY_CLIENT_ID");
  if (!client_secret) missingCredentials.push("SPOTIFY_CLIENT_SECRET");
  if (!refresh_token) missingCredentials.push("SPOTIFY_REFRESH_TOKEN");

  if (missingCredentials.length > 0) {
    throw new Error(
      `Missing Spotify credentials: ${missingCredentials.join(", ")}. Please check your environment variables.`,
    );
  }
};

/**
 * Basic authentication header required for token requests
 */
const getBasicAuth = () => {
  return Buffer.from(
    `${SPOTIFY_CONFIG.client_id}:${SPOTIFY_CONFIG.client_secret}`,
  ).toString("base64");
};

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

// Time ranges for Spotify API
export type TimeRange = "short_term" | "medium_term" | "long_term";

// Human-readable time range labels
export const TIME_RANGES = {
  short_term: "Last Month",
  medium_term: "Last 6 Months",
  long_term: "All Time",
};

/**
 * Fetches a new access token from Spotify
 * @returns Spotify access token
 * @throws Error if token fetch fails
 */
const getAccessToken = async (): Promise<string> => {
  try {
    // Check if we have a valid cached token
    if (tokenCache && Date.now() < tokenCache.expiresAt) {
      return tokenCache.token;
    }

    // Validate credentials before making API calls
    validateCredentials();

    const basicAuth = getBasicAuth();
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

    // Cache the token with expiration
    tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + TOKEN_CACHE_DURATION,
    };

    return data.access_token;
  } catch (error) {
    console.error("Spotify token error:", error);
    // Clear cache on error
    tokenCache = null;
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
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Throttle requests to prevent spam
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
      }
      lastRequestTime = Date.now();

      const token = await getAccessToken();

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // Use only one cache setting to avoid conflicts
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 204 && endpoint === ENDPOINTS.CURRENT) {
          return null as T;
        }

        // Handle empty responses that can't be parsed as JSON
        const text = await response.text();
        let error;
        try {
          error = JSON.parse(text);
        } catch {
          error = { error: `HTTP ${response.status}: ${text || "Empty response"}` };
        }

        throw new Error(
          `Spotify API error (${response.status}): ${error.error || "Unknown"}`,
        );
      }

      // Handle empty responses that can't be parsed as JSON
      const text = await response.text();
      if (!text.trim()) {
        if (endpoint === ENDPOINTS.CURRENT) {
          return null as T;
        }
        throw new Error("Empty response from Spotify API");
      }

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error(`Failed to parse JSON from ${endpoint}:`, text);
        throw new Error(`Invalid JSON response from Spotify API: ${parseError instanceof Error ? parseError.message : "Unknown parse error"}`);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      // Don't retry on certain errors
      if (lastError.message.includes("401") || lastError.message.includes("403")) {
        break; // Authentication errors shouldn't be retried
      }

      if (attempt < maxRetries) {
        // Exponential backoff: wait 1s, then 2s
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Spotify API attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  console.error(`Spotify API fetch error (${endpoint}) after ${maxRetries + 1} attempts:`, lastError);
  throw lastError || new Error("Failed to fetch from Spotify API");
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
 * @param timeRange Time range to fetch: short_term (1 month), medium_term (6 months), or long_term (years)
 * @returns Array of top tracks
 */
export const topTracks = async (timeRange: TimeRange = "medium_term"): Promise<ISpotifyTrack[]> => {
  try {
    const endpoint = `${ENDPOINTS.TOP_TRACKS}&time_range=${timeRange}`;
    const data = await spotifyFetch<{ items: ISpotifyTrack[] }>(endpoint);
    return data.items;
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch top tracks"
    );
  }
};

/**
 * Fetches the user's top artists from Spotify
 * @param timeRange Time range to fetch: short_term (1 month), medium_term (6 months), or long_term (years)
 * @returns Array of top artists
 */
export const topArtists = async (timeRange: TimeRange = "medium_term"): Promise<ISpotifyArtist[]> => {
  try {
    const endpoint = `${ENDPOINTS.TOP_ARTISTS}&time_range=${timeRange}`;
    const data = await spotifyFetch<{ items: ISpotifyArtist[] }>(endpoint);
    return data.items;
  } catch (error) {
    console.error("Error fetching top artists:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch top artists"
    );
  }
};

/**
 * Fetches the user's currently playing track from Spotify
 * @returns Currently playing track or null if nothing is playing
 */
export const currentPlaying = async (): Promise<ISpotifyTrack | null> => {
  try {
    console.log("Fetching currently playing track from Spotify...");

    // If no track is playing, this will return null
    const data = await spotifyFetch<{ item: ISpotifyTrack } | null>(
      ENDPOINTS.CURRENT,
    );

    if (!data) {
      console.log("No track currently playing");
      return null;
    }

    console.log("Successfully fetched currently playing track:", data.item.name);
    return data.item;
  } catch (error) {
    // Handle specific cases where user might not be playing anything
    if (error instanceof Error) {
      if (error.message.includes("204") || error.message.includes("Empty response")) {
        // User is not currently playing anything
        console.log("User is not currently playing anything (204/empty response)");
        return null;
      }
    }

    console.error("Error fetching currently playing track:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch currently playing track",
    );
  }
};
