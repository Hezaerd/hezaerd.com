import type {
  SpotifyArtistCard,
  SpotifyNowPlaying,
  SpotifyRecentItem,
  SpotifyTrackCard,
  TimeRange,
} from "@/types/spotify";

const TOKEN_CACHE_DURATION_MS = 50 * 60 * 1000;
const FETCH_LIMIT = 10;

type TokenCache = {
  token: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

type SpotifyImage = {
  url: string;
  height: number | null;
  width: number | null;
};

type SpotifyApiArtist = {
  id: string;
  name: string;
  external_urls: { spotify: string };
  images: SpotifyImage[];
  genres: string[];
};

type SpotifyApiTrack = {
  id: string;
  name: string;
  external_urls: { spotify: string };
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: SpotifyImage[];
  };
};

type SpotifyApiPlayHistoryItem = {
  track: SpotifyApiTrack;
  played_at: string;
};

function getCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  return { clientId, clientSecret, refreshToken };
}

function firstImageUrl(images: SpotifyImage[] | undefined): string | null {
  return images?.[0]?.url ?? null;
}

function toArtistCard(artist: SpotifyApiArtist): SpotifyArtistCard {
  return {
    id: artist.id,
    name: artist.name,
    url: artist.external_urls?.spotify ?? "",
    imageUrl: firstImageUrl(artist.images),
    genres: (artist.genres ?? []).slice(0, 2),
  };
}

function toTrackCard(track: SpotifyApiTrack): SpotifyTrackCard {
  return {
    id: track.id,
    name: track.name,
    url: track.external_urls?.spotify ?? "",
    imageUrl: firstImageUrl(track.album?.images),
    artists: (track.artists ?? []).map((artist) => artist.name).join(", "),
    albumName: track.album?.name ?? "",
  };
}

async function getAccessToken(): Promise<string | null> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const credentials = getCredentials();
  if (!credentials) {
    console.error("Spotify credentials not configured");
    return null;
  }

  const basicAuth = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString(
    "base64",
  );

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: credentials.refreshToken,
      }),
    });

    if (!response.ok) {
      console.error("Failed to refresh Spotify token:", response.status);
      tokenCache = null;
      return null;
    }

    const data = (await response.json()) as { access_token?: string };
    if (!data.access_token) {
      console.error("Spotify token response missing access_token");
      tokenCache = null;
      return null;
    }

    tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + TOKEN_CACHE_DURATION_MS,
    };

    return data.access_token;
  } catch (error) {
    console.error("Spotify token error:", error);
    tokenCache = null;
    return null;
  }
}

async function spotifyFetch<T>(endpoint: string): Promise<T | null> {
  const token = await getAccessToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      console.error(`Spotify API error (${response.status}) for ${endpoint}`);
      return null;
    }

    const text = await response.text();
    if (!text.trim()) {
      return null;
    }

    return JSON.parse(text) as T;
  } catch (error) {
    console.error(`Spotify fetch failed for ${endpoint}:`, error);
    return null;
  }
}

export async function getCurrentlyPlaying(): Promise<SpotifyNowPlaying | null> {
  const data = await spotifyFetch<{
    is_playing?: boolean;
    currently_playing_type?: string;
    item?: SpotifyApiTrack | null;
  }>("https://api.spotify.com/v1/me/player/currently-playing");

  // Episodes / ads don't match the track DTO shape.
  if (!data?.item || (data.currently_playing_type && data.currently_playing_type !== "track")) {
    return null;
  }

  return {
    ...toTrackCard(data.item),
    isPlaying: Boolean(data.is_playing),
  };
}

export async function getTopArtists(timeRange: TimeRange): Promise<SpotifyArtistCard[]> {
  const data = await spotifyFetch<{ items: SpotifyApiArtist[] }>(
    `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${FETCH_LIMIT}`,
  );

  return (data?.items ?? []).map(toArtistCard);
}

export async function getTopTracks(timeRange: TimeRange): Promise<SpotifyTrackCard[]> {
  const data = await spotifyFetch<{ items: SpotifyApiTrack[] }>(
    `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${FETCH_LIMIT}`,
  );

  return (data?.items ?? []).map(toTrackCard);
}

export async function getRecentlyPlayed(): Promise<SpotifyRecentItem[]> {
  const data = await spotifyFetch<{ items: SpotifyApiPlayHistoryItem[] }>(
    `https://api.spotify.com/v1/me/player/recently-played?limit=${FETCH_LIMIT}`,
  );

  return (data?.items ?? [])
    .filter((item) => item.track?.id)
    .map((item) => ({
      id: `${item.track.id}-${item.played_at}`,
      name: item.track.name,
      url: item.track.external_urls?.spotify ?? "",
      imageUrl: firstImageUrl(item.track.album?.images),
      artists: (item.track.artists ?? []).map((artist) => artist.name).join(", "),
      playedAt: item.played_at,
    }));
}
