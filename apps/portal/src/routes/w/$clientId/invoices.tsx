import { Button } from "@hezaerd/ui/components/button";
import {
  CheckmarkCircle01Icon,
  Invoice01Icon,
  ReceiptDollarIcon,
  TimeQuarterPassIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
          <h1 className="font-display text-2xl font-semibold tracking-tight">Factures</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Les factures impayées apparaissent en premier. L&apos;historique des paiements est
          archivé en dessous.
        </p>
      </div>

      {/* Unpaid section */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-tight tracking-wider uppercase">
          À payer
        </h2>

        {/* Invoice card */}
        <div className="border-border border-l-primary/60 bg-primary/5 rounded-xl border border-l-2 px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <HugeiconsIcon icon={ReceiptDollarIcon} size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold tracking-tight">Facture n°1042</p>
                <p className="text-muted-foreground mt-0.5 text-sm">Forfait mensuel</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-primary text-xl font-semibold tracking-tight">
                2 400 €
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-amber-400">
              <HugeiconsIcon icon={TimeQuarterPassIcon} size={13} />
              <span className="font-mono text-xs font-medium">Échéance dans 5 jours</span>
            </div>
            <Button size="sm">Payer la facture</Button>
          </div>
        </div>
      </section>

      {/* Paid history section */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-tight tracking-wider uppercase">
          Historique des paiements
        </h2>

        <div className="border-border bg-muted/10 flex flex-col items-center justify-center gap-2 rounded-xl border py-10 text-center">
          <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-full">
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              size={16}
              className="text-muted-foreground"
            />
          </div>
          <p className="font-display text-sm font-semibold tracking-tight">
            Aucune facture payée pour l&apos;instant
          </p>
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            Les factures payées apparaîtront ici une fois le paiement traité.
          </p>
        </div>
      </section>
    </div>
  );
}
