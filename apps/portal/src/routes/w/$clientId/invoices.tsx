import {
  CheckmarkCircle01Icon,
  Invoice01Icon,
  ReceiptDollarIcon,
  TimeQuarterPassIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@hezaerd/ui/components/button";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/w/$clientId/invoices")({
  component: ClientInvoicesPage,
});

function ClientInvoicesPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Invoice01Icon} size={16} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Invoices
          </h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Unpaid invoices are shown first. Paid history is archived below.
        </p>
      </div>

      {/* Unpaid section */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-sm font-semibold tracking-tight text-muted-foreground uppercase tracking-wider">
          Due
        </h2>

        {/* Invoice card */}
        <div className="border-border border-l-primary/60 bg-primary/5 border border-l-2 rounded-xl px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5">
                <HugeiconsIcon icon={ReceiptDollarIcon} size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold tracking-tight">
                  Invoice #1042
                </p>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  Monthly retainer
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-xl font-semibold tracking-tight text-primary">
                $2,400
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-amber-400">
              <HugeiconsIcon icon={TimeQuarterPassIcon} size={13} />
              <span className="font-mono text-xs font-medium">Due in 5 days</span>
            </div>
            <Button size="sm">
              Pay invoice
            </Button>
          </div>
        </div>
      </section>

      {/* Paid history section */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-sm font-semibold tracking-tight text-muted-foreground uppercase tracking-wider">
          Paid history
        </h2>

        <div className="border-border bg-muted/10 flex flex-col items-center justify-center gap-2 rounded-xl border py-10 text-center">
          <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-full">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-muted-foreground" />
          </div>
          <p className="font-display text-sm font-semibold tracking-tight">
            No paid invoices yet
          </p>
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            Earlier paid invoices will appear here once a payment is processed.
          </p>
        </div>
      </section>
    </div>
  );
}
