import { api } from "@hezaerd/backend/api";
import type { Id } from "@hezaerd/backend/dataModel";
import { Invoice01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";

import { createFileRoute } from "@tanstack/react-router";

import { InvoiceCreateForm } from "@/components/invoices/invoice-create-form";
import { OperatorInvoiceRow } from "@/components/invoices/operator-invoice-row";
import { invoicesByClientQuery } from "@/lib/convex-queries";
import type { PortalInvoice } from "@/lib/portal-types";

export const Route = createFileRoute("/op/clients/$clientId/invoices")({
  component: ClientDeskInvoicesPage,
});

function ClientDeskInvoicesPage() {
  const { clientId } = Route.useParams();
  const { data: invoices } = useSuspenseQuery(invoicesByClientQuery(clientId));
  const createInvoice = useMutation(api.invoices.create);
  const sendInvoice = useMutation(api.invoices.send);
  const cancelInvoice = useMutation(api.invoices.cancel);
  const markPaidBankWire = useMutation(api.invoices.markPaidBankWire);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
          <HugeiconsIcon icon={Invoice01Icon} size={16} className="text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Factures</h2>
          <p className="text-muted-foreground text-xs">Côté cabinet — factures pour ce client</p>
        </div>
      </div>

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
          <div className="border-border bg-muted/20 flex min-h-[8rem] items-center justify-center rounded-xl border">
            <p className="text-muted-foreground text-sm">Aucune facture pour ce client.</p>
          </div>
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
