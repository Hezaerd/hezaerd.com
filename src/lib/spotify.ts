import {
  ISpotifyAccessToken,
  ISpotifyAlbum,
  ISpotifyArtist,
  ISpotifyTrack,
} from "@/interfaces/spotify";

const client_id = process.env.SPOTIFY_CLIENT_ID || "";
const client_secret = process.env.SPOTIFY_CLIENT_SECRET || "";
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN || "";

if (!client_id || !client_secret || !refresh_token) {
  throw new Error("Missing Spotify credentials");
}

const auth = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

const ENDPOINTS = {
  TOKEN: "https://accounts.spotify.com/api/token",
  CURRENT: "https://api.spotify.com/v1/me/player/currently-playing",
  RECENTLY: "https://api.spotify.com/v1/me/player/recently-played?limit=5",
  TOP_TRACKS: "https://api.spotify.com/v1/me/top/tracks?limit=5",
  TOP_ARTISTS: "https://api.spotify.com/v1/me/top/artists?limit=5",
};

const getAccessToken = async (): Promise<ISpotifyAccessToken> => {
  const response = await fetch(ENDPOINTS.TOKEN, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });

  const data = await response.json();

  return data.access_token;
};

export const recentlyPlayed = async (): Promise<ISpotifyTrack[]> => {
  try {
    console.log("Fetching recently played tracks...");
    const token = await getAccessToken();
    console.log("Access token retrieved:", token);

    const response = await fetch(ENDPOINTS.RECENTLY, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Error fetching recently played tracks: ${response.statusText}`,
      );
    }

    const data = await response.json();

    return data.items as ISpotifyTrack[];
  } catch (error) {
    console.error("Error in recentlyPlayed:", error);
    throw error;
  }
};

export const topTracks = async (): Promise<ISpotifyTrack[]> => {
  try {
    console.log("Fetching top tracks...");
    const token = await getAccessToken();
    console.log("Access token retrieved:", token);

    const response = await fetch(ENDPOINTS.TOP_TRACKS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`Error fetching top tracks: ${response.statusText}`);
    }

    const data = await response.json();

    return data.items as ISpotifyTrack[];
  } catch (error) {
    console.error("Error in topTracks:", error);
    throw error;
  }
};

export const topArtists = async (): Promise<ISpotifyArtist[]> => {
  try {
    console.log("Fetching top artists...");
    const token = await getAccessToken();
    console.log("Access token retrieved:", token);

    const response = await fetch(ENDPOINTS.TOP_ARTISTS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`Error fetching top artists: ${response.statusText}`);
    }

    const data = await response.json();

    return data.items as ISpotifyArtist[];
  } catch (error) {
    console.error("Error in topArtists:", error);
    throw error;
  }
};

export const currentPlaying = async (): Promise<ISpotifyTrack | null> => {
  try {
    console.log("Fetching currently playing track...");
    const token = await getAccessToken();
    console.log("Access token retrieved:", token);

    const response = await fetch(ENDPOINTS.CURRENT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    console.log("Response status:", response.status);

    if (response.status === 204) {
      console.log("No currently playing track.");
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `Error fetching currently playing track: ${response.statusText}`,
      );
    }

    const data = await response.json();

    return data.item as ISpotifyTrack;
  } catch (error) {
    console.error("Error in currentPlaying:", error);
    throw error;
  }
};
