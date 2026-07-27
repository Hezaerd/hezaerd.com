import { api } from "@hezaerd/backend/api";
import type { Id } from "@hezaerd/backend/dataModel";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hezaerd/ui/components/empty";
import { Invoice01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAction } from "convex/react";

import { createFileRoute } from "@tanstack/react-router";

import { ClientInvoiceCard } from "@/components/invoices/client-invoice-card";
import { invoicesForWorkspaceQuery } from "@/lib/convex-queries";
import type { PortalInvoice } from "@/lib/portal-types";

export const Route = createFileRoute("/w/$clientId/invoices")({
  component: ClientInvoicesPage,
});

function ClientInvoicesPage() {
  const { clientId } = Route.useParams();
  const { data: invoices } = useSuspenseQuery(invoicesForWorkspaceQuery(clientId));
  const startCheckout = useAction(api.invoiceCheckout.startCheckout);

  const openInvoices = invoices.filter((invoice) => invoice.status === "open");
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid");

  async function handlePay(invoiceId: string) {
    const result = await startCheckout({
      invoiceId: invoiceId as Id<"invoices">,
      returnBaseUrl: window.location.origin,
    });
    if (result.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
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

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-tight tracking-wider uppercase">
          À payer
        </h2>
        {openInvoices.length === 0 ? (
          <Empty className="border-border bg-muted/20 rounded-xl border py-10">
            <EmptyHeader>
              <EmptyTitle className="font-display text-sm font-semibold tracking-tight">
                Rien à payer
              </EmptyTitle>
              <EmptyDescription className="text-muted-foreground text-sm">
                Les factures ouvertes apparaîtront ici.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          openInvoices.map((invoice) => (
            <ClientInvoiceCard
              key={invoice._id}
              invoice={invoice as PortalInvoice}
              onPay={handlePay}
            />
          ))
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-tight tracking-wider uppercase">
          Historique des paiements
        </h2>
        {paidInvoices.length === 0 ? (
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
        ) : (
          paidInvoices.map((invoice) => (
            <ClientInvoiceCard key={invoice._id} invoice={invoice as PortalInvoice} />
          ))
        )}
      </section>
    </div>
  );
}
