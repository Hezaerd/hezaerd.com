/**
 * One-shot helper to mint a Spotify refresh token for local/prod env.
 *
 * Usage:
 *   SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... bun scripts/spotify-get-refresh-token.ts
 *
 * Dashboard redirect URI must be exactly: http://127.0.0.1:3001/callback
 * Scopes: user-read-currently-playing user-read-recently-played user-top-read
 */

const REDIRECT_URI = "http://127.0.0.1:3001/callback";
const SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-top-read",
].join(" ");

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET before running.");
  process.exit(1);
}

const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
authorizeUrl.searchParams.set("client_id", clientId);
authorizeUrl.searchParams.set("response_type", "code");
authorizeUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authorizeUrl.searchParams.set("scope", SCOPES);

const server = Bun.serve({
  port: 3001,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname !== "/callback") {
      return new Response("Waiting for Spotify callback at /callback", {
        status: 404,
      });
    }

    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      console.error("Spotify authorization error:", error);
      setTimeout(() => process.exit(1), 100);
      return new Response(`Authorization failed: ${error}`, { status: 400 });
    }

    if (!code) {
      return new Response("Missing authorization code", { status: 400 });
    }

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const payload = (await tokenResponse.json()) as {
      refresh_token?: string;
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenResponse.ok || !payload.refresh_token) {
      console.error("Token exchange failed:", payload);
      setTimeout(() => process.exit(1), 100);
      return new Response("Token exchange failed. Check the terminal.", {
        status: 500,
      });
    }

    console.log("\nSPOTIFY_REFRESH_TOKEN=");
    console.log(payload.refresh_token);
    console.log("\nCopy into apps/portfolio/.env.local (and Vercel env).\n");

    setTimeout(() => {
      server.stop();
      process.exit(0);
    }, 100);

    return new Response(
      "<h1>Success</h1><p>Refresh token printed in the terminal. You can close this tab.</p>",
      { headers: { "Content-Type": "text/html" } },
    );
  },
});

console.log("Listening on http://127.0.0.1:3001/callback");
console.log("Open this URL and authorize:\n");
console.log(authorizeUrl.toString());
console.log("");
