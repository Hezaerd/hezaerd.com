import type { PortalInvoice } from "@/lib/portal-types";

import { Button } from "@hezaerd/ui/components/button";
import { Input } from "@hezaerd/ui/components/input";
import { ReceiptDollarIcon, TimeQuarterPassIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import {
  formatDueDateLabel,
  formatEuroFromCents,
  formatInvoiceNumber,
  paymentMethodLabel,
} from "@/lib/invoice-format";

type OperatorInvoiceRowProps = {
  invoice: PortalInvoice;
  onSend?: (invoiceId: PortalInvoice["_id"]) => Promise<void>;
  onCancel?: (invoiceId: PortalInvoice["_id"]) => Promise<void>;
  onMarkPaidBankWire?: (invoiceId: PortalInvoice["_id"], transferRef?: string) => Promise<void>;
};

const statusLabels: Record<PortalInvoice["status"], string> = {
  draft: "Brouillon",
  open: "Ouverte",
  paid: "Payée",
  cancelled: "Annulée",
};

export function OperatorInvoiceRow({
  invoice,
  onSend,
  onCancel,
  onMarkPaidBankWire,
}: OperatorInvoiceRowProps) {
  const [transferRef, setTransferRef] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const dueLabel = formatDueDateLabel(invoice.dueDate);

  async function runAction(key: string, action: () => Promise<void>) {
    setBusy(key);
    try {
      await action();
      if (key === "bank_wire") {
        setTransferRef("");
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="bg-muted mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={ReceiptDollarIcon} size={16} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-sm font-semibold tracking-tight">
                Facture {formatInvoiceNumber(invoice.number)}
              </p>
              <span className="border-border bg-muted/50 text-muted-foreground rounded px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide uppercase">
                {statusLabels[invoice.status]}
              </span>
            </div>
            <p className="text-muted-foreground mt-0.5 text-sm">{invoice.label}</p>
            {invoice.clientName ? (
              <p className="text-muted-foreground mt-1 text-xs">{invoice.clientName}</p>
            ) : null}
            {invoice.payment ? (
              <p className="text-muted-foreground mt-1 text-xs">
                Payée via {paymentMethodLabel(invoice.payment.method)}
                {invoice.payment.transferRef ? ` · ${invoice.payment.transferRef}` : ""}
              </p>
            ) : null}
          </div>
        </div>
        <p className="font-display shrink-0 text-lg font-semibold tracking-tight tabular-nums">
          {formatEuroFromCents(invoice.amountCents)}
        </p>
      </div>

      {dueLabel && invoice.status === "open" ? (
        <div className="flex items-center gap-1.5 text-amber-400">
          <HugeiconsIcon icon={TimeQuarterPassIcon} size={13} />
          <span className="font-mono text-xs font-medium">{dueLabel}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {invoice.status === "draft" && onSend ? (
          <Button
            size="sm"
            disabled={busy !== null}
            onClick={() => void runAction("send", () => onSend(invoice._id))}
          >
            {busy === "send" ? "Envoi…" : "Envoyer"}
          </Button>
        ) : null}

        {(invoice.status === "draft" || invoice.status === "open") && onCancel ? (
          <Button
            size="sm"
            variant="outline"
            disabled={busy !== null}
            onClick={() => void runAction("cancel", () => onCancel(invoice._id))}
          >
            {busy === "cancel" ? "Annulation…" : "Annuler"}
          </Button>
        ) : null}

        {invoice.status === "open" && onMarkPaidBankWire ? (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={transferRef}
              onChange={(event) => setTransferRef(event.target.value)}
              placeholder="Réf. virement (optionnel)"
              className="h-8 w-48"
            />
            <Button
              size="sm"
              variant="secondary"
              disabled={busy !== null}
              onClick={() =>
                void runAction("bank_wire", () =>
                  onMarkPaidBankWire(invoice._id, transferRef.trim() || undefined),
                )
              }
            >
              {busy === "bank_wire" ? "Enregistrement…" : "Marquer payée (virement)"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
