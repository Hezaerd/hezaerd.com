import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { code, redirect_uri, client_id, client_secret } = await request.json();

		if (!code || !redirect_uri || !client_id || !client_secret) {
			return new Response(
				JSON.stringify({ error: "Missing required parameters" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// Exchange authorization code for tokens
		const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code,
				redirect_uri,
			}),
		});

		if (!tokenResponse.ok) {
			const errorData = await tokenResponse.text();
			console.error(`Spotify token exchange failed: ${tokenResponse.status}`, errorData);
			return new Response(
				JSON.stringify({ error: "Failed to exchange code for tokens" }),
				{ status: tokenResponse.status, headers: { "Content-Type": "application/json" } }
			);
		}

		const tokenData = await tokenResponse.json();

		return new Response(JSON.stringify(tokenData), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Token exchange error:", error);
		return new Response(
			JSON.stringify({ error: "Internal server error" }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}
