import type { Id } from "@hezaerd/backend/dataModel";
import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";

import { InvoiceCreateForm } from "@/components/invoices/invoice-create-form";
import { OperatorInvoiceRow } from "@/components/invoices/operator-invoice-row";
import {
  ClientDeskPage,
  ClientDeskPageHeader,
  DeskEmptyState,
} from "@/components/shell/client-desk-layout";
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
    <ClientDeskPage>
      <ClientDeskPageHeader title="Factures" />

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
          <DeskEmptyState title="Aucune facture" />
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
    </ClientDeskPage>
  );
}
