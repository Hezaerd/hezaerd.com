import type { Id } from "@hezaerd/backend/dataModel";
import { Empty, EmptyHeader, EmptyTitle } from "@hezaerd/ui/components/empty";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Link, createFileRoute } from "@tanstack/react-router";

import { OperatorInvoiceRow } from "@/components/invoices/operator-invoice-row";
import { invoicesAllQuery } from "@/lib/convex-queries";
import { useInvoiceMutations } from "@/lib/convex-optimistic";
import type { PortalInvoice } from "@/lib/portal-types";

export const Route = createFileRoute("/op/invoices")({
  component: OperatorInvoicesPage,
});

function OperatorInvoicesPage() {
  const { data: invoices } = useSuspenseQuery(invoicesAllQuery);
  const { sendInvoice, cancelInvoice, markPaidBankWire } = useInvoiceMutations();

  const openInvoices = invoices.filter((invoice) => invoice.status === "open");
  const otherInvoices = invoices.filter((invoice) => invoice.status !== "open");

  return (
    <div className="flex flex-col gap-8">
      {invoices.length === 0 ? (
        <Empty className="border-border bg-muted/20 rounded-xl border py-12">
          <EmptyHeader>
            <EmptyTitle className="font-display text-base font-semibold tracking-tight">
              Aucune facture
            </EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-8">
          {openInvoices.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                Ouvertes
              </h2>
              <div className="flex flex-col gap-3">
                {openInvoices.map((invoice) => (
                  <OperatorInvoiceRow
                    key={invoice._id}
                    invoice={invoice as PortalInvoice}
                    onCancel={async (invoiceId) => {
                      await cancelInvoice({ invoiceId: invoiceId as Id<"invoices"> });
                    }}
                    onMarkPaidBankWire={async (invoiceId, transferRef) => {
                      await markPaidBankWire({
                        invoiceId: invoiceId as Id<"invoices">,
                        transferRef,
                      });
                    }}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {otherInvoices.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                Historique
              </h2>
              <div className="flex flex-col gap-3">
                {otherInvoices.map((invoice) => (
                  <div key={invoice._id} className="flex flex-col gap-2">
                    <OperatorInvoiceRow
                      invoice={invoice as PortalInvoice}
                      onSend={async (invoiceId) => {
                        await sendInvoice({ invoiceId: invoiceId as Id<"invoices"> });
                      }}
                      onCancel={async (invoiceId) => {
                        await cancelInvoice({ invoiceId: invoiceId as Id<"invoices"> });
                      }}
                    />
                    {invoice.clientSlug ? (
                      <Link
                        to="/op/clients/$clientId/invoices"
                        params={{ clientId: invoice.clientSlug }}
                        className="text-muted-foreground hover:text-foreground pl-14 text-xs font-medium"
                      >
                        Voir son bureau
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
