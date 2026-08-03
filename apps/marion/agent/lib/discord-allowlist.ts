export function allowedDiscordOperatorIds(): Set<string> {
  const raw = process.env.DISCORD_OPERATOR_USER_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export function isAllowedDiscordUser(userId: string): boolean {
  const allowed = allowedDiscordOperatorIds();
  if (allowed.size === 0) {
    return false;
  }
  return allowed.has(userId);
}
