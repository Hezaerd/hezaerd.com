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
  TOP_TRACKS: "https://api.spotify.com/v1/me/top/tracks",
  TOP_ARTISTS: "https://api.spotify.com/v1/me/top/artists",
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
  const token = await getAccessToken();

  const response = await fetch(ENDPOINTS.RECENTLY, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  return data.items as ISpotifyTrack[];
};

export const topTracks = async (): Promise<ISpotifyTrack[]> => {
  const token = await getAccessToken();

  const response = await fetch(ENDPOINTS.TOP_TRACKS, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  return data.items as ISpotifyTrack[];
};

export const topArtists = async (): Promise<ISpotifyArtist[]> => {
  const token = await getAccessToken();

  const response = await fetch(ENDPOINTS.TOP_ARTISTS, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  return data.items as ISpotifyArtist[];
};

export const currentPlaying = async (): Promise<ISpotifyTrack | null> => {
  const token = await getAccessToken();

  const response = await fetch(ENDPOINTS.CURRENT, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  return data.item as ISpotifyTrack;
};
