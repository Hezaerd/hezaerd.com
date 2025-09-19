import { cache } from "react";
import type {
	SpotifyArtist,
	SpotifyRecentlyPlayedResponse,
	SpotifyTopArtistsResponse,
	SpotifyTopTracksResponse,
	SpotifyTrack,
	TimeRange,
} from "@/types/spotify";

async function getSpotifyAccessToken(): Promise<string> {
	const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

	if (!refreshToken || !clientId || !clientSecret) {
		throw new Error("Spotify credentials not configured");
	}

	const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refreshToken,
		}),
		next: { revalidate: 3000 }, // Cache for 50 minutes (tokens expire in 1 hour)
	});

	if (!tokenResponse.ok) {
		throw new Error(`Failed to refresh Spotify token: ${tokenResponse.status}`);
	}

	const { access_token } = await tokenResponse.json();
	return access_token;
}

// Cache top artists for 1 hour since they don't change frequently
export const getTopArtists = cache(
	async (timeRange: TimeRange): Promise<SpotifyArtist[]> => {
		try {
			const accessToken = await getSpotifyAccessToken();

			const response = await fetch(
				`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=10`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
					next: { revalidate: 3600 }, // Cache for 1 hour
				},
			);

			if (!response.ok) {
				throw new Error(`Failed to fetch top artists: ${response.status}`);
			}

			const data: SpotifyTopArtistsResponse = await response.json();
			return data.items;
		} catch (error) {
			console.error("Error fetching top artists:", error);
			return [];
		}
	},
);

// Cache top tracks for 1 hour since they don't change frequently
export const getTopTracks = cache(
	async (timeRange: TimeRange): Promise<SpotifyTrack[]> => {
		try {
			const accessToken = await getSpotifyAccessToken();

			const response = await fetch(
				`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=10`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
					next: { revalidate: 3600 }, // Cache for 1 hour
				},
			);

			if (!response.ok) {
				throw new Error(`Failed to fetch top tracks: ${response.status}`);
			}

			const data: SpotifyTopTracksResponse = await response.json();
			return data.items;
		} catch (error) {
			console.error("Error fetching top tracks:", error);
			return [];
		}
	},
);

// No caching for recently played since it should be real-time
export const getRecentlyPlayed = cache(async () => {
	try {
		const accessToken = await getSpotifyAccessToken();

		const response = await fetch(
			`https://api.spotify.com/v1/me/player/recently-played?limit=20`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				next: { revalidate: 300 }, // Cache for 5 minutes only
			},
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch recently played: ${response.status}`);
		}

		const data: SpotifyRecentlyPlayedResponse = await response.json();
		return data.items;
	} catch (error) {
		console.error("Error fetching recently played:", error);
		return [];
	}
});
