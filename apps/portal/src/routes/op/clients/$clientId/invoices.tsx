import type { Id } from "@hezaerd/backend/dataModel";
import { Empty, EmptyHeader, EmptyTitle } from "@hezaerd/ui/components/empty";
import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";

import { InvoiceCreateForm } from "@/components/invoices/invoice-create-form";
import { OperatorInvoiceRow } from "@/components/invoices/operator-invoice-row";
import { invoicesByClientQuery } from "@/lib/convex-queries";
import { useInvoiceMutations } from "@/lib/convex-optimistic";
import type { PortalInvoice } from "@/lib/portal-types";

export const Route = createFileRoute("/op/clients/$clientId/invoices")({
  component: ClientDeskInvoicesPage,
});

function ClientDeskInvoicesPage() {
  const { clientId } = Route.useParams();
  const { data: invoices } = useSuspenseQuery(invoicesByClientQuery(clientId));
  const { createInvoice, sendInvoice, cancelInvoice, markPaidBankWire } = useInvoiceMutations();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <InvoiceCreateForm
        onCreate={async (input) => {
          await createInvoice({
            slug: clientId,
            label: input.label,
            amountCents: input.amountCents,
            dueDate: input.dueDate,
            send: input.send,
          });
        }}
      />

      <div className="flex flex-col gap-3">
        {invoices.length === 0 ? (
          <Empty className="border-border bg-muted/20 rounded-xl border py-12">
            <EmptyHeader>
              <EmptyTitle className="font-display text-base font-semibold tracking-tight">
                Aucune facture
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          invoices.map((invoice) => (
            <OperatorInvoiceRow
              key={invoice._id}
              invoice={invoice as PortalInvoice}
              onSend={async (invoiceId) => {
                await sendInvoice({ invoiceId: invoiceId as Id<"invoices"> });
              }}
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
          ))
        )}
      </div>
    </div>
  );
}
