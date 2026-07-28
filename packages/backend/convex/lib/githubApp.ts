import { SignJWT, importPKCS8 } from "jose";

type GithubCommit = {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  html_url: string;
};

export type GithubCommitSummary = {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  committedAt: number;
  url: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

async function createAppJwt(): Promise<string> {
  const appId = requireEnv("GITHUB_APP_ID");
  const privateKeyPem = requireEnv("GITHUB_APP_PRIVATE_KEY").replace(/\\n/g, "\n");
  const privateKey = await importPKCS8(privateKeyPem, "RS256");

  return await new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .setExpirationTime("9m")
    .setIssuer(appId)
    .sign(privateKey);
}

async function getInstallationAccessToken(): Promise<string> {
  const installationId = requireEnv("GITHUB_APP_INSTALLATION_ID");
  const appJwt = await createAppJwt();

  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${appJwt}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub installation token failed (${response.status}): ${body}`);
  }

  const json = (await response.json()) as { token: string };
  return json.token;
}

export async function fetchRecentCommits(args: {
  githubRepo: string;
  branch: string;
  limit?: number;
}): Promise<GithubCommitSummary[]> {
  const token = await getInstallationAccessToken();
  const limit = args.limit ?? 5;
  const url = new URL(`https://api.github.com/repos/${args.githubRepo}/commits`);
  url.searchParams.set("sha", args.branch);
  url.searchParams.set("per_page", String(limit));

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub commits fetch failed (${response.status}): ${body}`);
  }

  const commits = (await response.json()) as GithubCommit[];
  return commits.map((commit) => ({
    sha: commit.sha,
    shortSha: commit.sha.slice(0, 7),
    message: commit.commit.message.split("\n")[0] ?? commit.commit.message,
    author: commit.commit.author.name,
    committedAt: Date.parse(commit.commit.author.date),
    url: commit.html_url,
  }));
}

export async function verifyGithubWebhookSignature(args: {
  payload: string;
  signatureHeader: string | null;
}): Promise<boolean> {
  const secret = requireEnv("GITHUB_WEBHOOK_SECRET");
  if (!args.signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const expectedHex = args.signatureHeader.slice("sha256=".length);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(args.payload));
  const actualHex = [...new Uint8Array(signature)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expectedHex.length !== actualHex.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < expectedHex.length; i += 1) {
    mismatch |= expectedHex.charCodeAt(i) ^ actualHex.charCodeAt(i);
  }
  return mismatch === 0;
}
