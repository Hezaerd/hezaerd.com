import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const timeRange = searchParams.get("time_range") || "medium_term";
		const limit = searchParams.get("limit") || "10";

		const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
		const clientId = process.env.SPOTIFY_CLIENT_ID;
		const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

		if (!refreshToken || !clientId || !clientSecret) {
			return new Response(
				JSON.stringify({ error: "Spotify credentials not configured" }),
				{ status: 500, headers: { "Content-Type": "application/json" } },
			);
		}

		// Get access token using refresh token
		const tokenResponse = await fetch(
			"https://accounts.spotify.com/api/token",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
				},
				body: new URLSearchParams({
					grant_type: "refresh_token",
					refresh_token: refreshToken,
				}),
			},
		);

		if (!tokenResponse.ok) {
			const errorData = await tokenResponse.text();
			console.error(
				`Spotify token refresh failed: ${tokenResponse.status}`,
				errorData,
			);
			return new Response(
				JSON.stringify({ error: "Failed to refresh token" }),
				{
					status: tokenResponse.status,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const { access_token } = await tokenResponse.json();

		// Fetch top artists
		const artistsResponse = await fetch(
			`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`,
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			},
		);

		if (!artistsResponse.ok) {
			const errorData = await artistsResponse.text();
			console.error(`Spotify API error: ${artistsResponse.status}`, errorData);
			return new Response(
				JSON.stringify({ error: "Failed to fetch top artists" }),
				{
					status: artistsResponse.status,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const artistsData = await artistsResponse.json();

		return new Response(JSON.stringify(artistsData), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Top artists fetch error:", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
