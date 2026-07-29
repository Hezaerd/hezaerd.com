export function normalizeClientEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidClientEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeClientEmail(email));
}

export function findClientByContactEmail<T extends { contactEmail: string; name: string }>(
  clients: T[],
  email: string,
): T | undefined {
  const normalized = normalizeClientEmail(email);
  return clients.find((client) => normalizeClientEmail(client.contactEmail) === normalized);
}

export function existingContactEmailSet(clients: { contactEmail: string }[]): Set<string> {
  return new Set(clients.map((client) => normalizeClientEmail(client.contactEmail)));
}
