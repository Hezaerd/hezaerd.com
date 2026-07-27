const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export function formatEuroFromCents(amountCents: number): string {
  return euroFormatter.format(amountCents / 100);
}

export function parseEuroInputToCents(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  if (!normalized) {
    return null;
  }
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return Math.round(amount * 100);
}

export function formatInvoiceNumber(number: number): string {
  return `#${number}`;
}

export function formatDueDateLabel(dueDateMs: number | undefined): string | null {
  if (!dueDateMs) {
    return null;
  }

  const due = new Date(dueDateMs);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `En retard de ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? "s" : ""}`;
  }
  if (diffDays === 0) {
    return "Échéance aujourd'hui";
  }
  if (diffDays === 1) {
    return "Échéance demain";
  }
  return `Échéance dans ${diffDays} jours`;
}

export function paymentMethodLabel(method: "stripe" | "bank_wire"): string {
  return method === "stripe" ? "Carte / SEPA" : "Virement";
}

export function toDateInputValue(timestampMs: number | undefined): string {
  if (!timestampMs) {
    return "";
  }
  const date = new Date(timestampMs);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateInputValue(value: string): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed.getTime();
}
