import type { PortalInvoice } from "@/lib/portal-types";

import { Button } from "@hezaerd/ui/components/button";
import { ReceiptDollarIcon, TimeQuarterPassIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import {
  formatDueDateLabel,
  formatEuroFromCents,
  formatInvoiceNumber,
  paymentMethodLabel,
} from "@/lib/invoice-format";

type ClientInvoiceCardProps = {
  invoice: PortalInvoice;
  onPay?: (invoiceId: PortalInvoice["_id"]) => Promise<void>;
};

export function ClientInvoiceCard({ invoice, onPay }: ClientInvoiceCardProps) {
  const [paying, setPaying] = useState(false);
  const dueLabel = formatDueDateLabel(invoice.dueDate);
  const isOpen = invoice.status === "open";

  async function handlePay() {
    if (!onPay) {
      return;
    }
    setPaying(true);
    try {
      await onPay(invoice._id);
    } finally {
      setPaying(false);
    }
  }

  return (
    <div
      className={`rounded-xl border px-5 py-5 ${
        isOpen
          ? "border-border border-l-primary/60 bg-primary/5 border-l-2"
          : "border-border bg-muted/10"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              isOpen ? "bg-primary/10" : "bg-muted"
            }`}
          >
            <HugeiconsIcon
              icon={ReceiptDollarIcon}
              size={16}
              className={isOpen ? "text-primary" : "text-muted-foreground"}
            />
          </div>
          <div>
            <p className="font-display text-sm font-semibold tracking-tight">
              Facture {formatInvoiceNumber(invoice.number)}
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">{invoice.label}</p>
            {invoice.payment ? (
              <p className="text-muted-foreground mt-1 text-xs">
                Payée · {paymentMethodLabel(invoice.payment.method)}
              </p>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={`font-display text-xl font-semibold tracking-tight tabular-nums ${
              isOpen ? "text-primary" : ""
            }`}
          >
            {formatEuroFromCents(invoice.amountCents)}
          </p>
        </div>
      </div>

      {isOpen ? (
        <div className="mt-4 flex items-center justify-between gap-4">
          {dueLabel ? (
            <div className="flex items-center gap-1.5 text-amber-400">
              <HugeiconsIcon icon={TimeQuarterPassIcon} size={13} />
              <span className="font-mono text-xs font-medium">{dueLabel}</span>
            </div>
          ) : (
            <span />
          )}
          <Button size="sm" disabled={paying} onClick={() => void handlePay()}>
            {paying ? "Redirection…" : "Payer la facture"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
