const BOT_UA_PATTERNS = [
  "bot",
  "spider",
  "crawl",
  "preview",
  "slurp",
  "mediapartners",
  "headless",
  "phantomjs",
];

export function isBotUserAgent(userAgent: string): boolean {
  const trimmed = userAgent.trim();
  if (!trimmed) {
    return true;
  }
  const lower = trimmed.toLowerCase();
  return BOT_UA_PATTERNS.some((pattern) => lower.includes(pattern));
}

/** IPv4 /24, IPv6 /48 — input discarded after hashing. */
export function truncateIp(ip: string): string {
  const trimmed = ip.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.includes(":")) {
    const normalized = trimmed.toLowerCase();
    const expanded = expandIpv6(normalized);
    const hextets = expanded.split(":");
    if (hextets.length < 3) {
      return trimmed;
    }
    return `${hextets.slice(0, 3).join(":")}::`;
  }

  const parts = trimmed.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }

  return trimmed;
}

function expandIpv6(ip: string): string {
  if (!ip.includes("::")) {
    return ip;
  }

  const [head, tail] = ip.split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = tail ? tail.split(":") : [];
  const missing = 8 - headParts.length - tailParts.length;
  const middle = Array.from({ length: Math.max(missing, 0) }, () => "0");
  return [...headParts, ...middle, ...tailParts].join(":");
}

export async function computeVisitorHash(
  secret: string,
  siteKey: string,
  dayKey: string,
  truncatedIp: string,
  userAgent: string,
): Promise<string> {
  const message = `${siteKey}|${dayKey}|${truncatedIp}|${userAgent}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
