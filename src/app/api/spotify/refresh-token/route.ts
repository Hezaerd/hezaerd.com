import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { refresh_token } = await request.json();

		if (!refresh_token) {
			return new Response(JSON.stringify({ error: "Missing refresh token" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const clientId = process.env.SPOTIFY_CLIENT_ID;
		const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

		if (!clientId || !clientSecret) {
			return new Response(
				JSON.stringify({ error: "Spotify credentials not configured" }),
				{ status: 500, headers: { "Content-Type": "application/json" } },
			);
		}

		// Exchange refresh token for new access token
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
					refresh_token,
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

		const tokenData = await tokenResponse.json();

		return new Response(JSON.stringify(tokenData), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Token refresh error:", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
