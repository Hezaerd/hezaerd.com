import { Invoice01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/op/clients/$clientId/invoices")({
  component: ClientDeskInvoicesPage,
});

function ClientDeskInvoicesPage() {
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
      <div className="border-border bg-muted/20 flex min-h-[12rem] items-center justify-center rounded-xl border">
        <p className="text-muted-foreground text-sm">À venir.</p>
      </div>
    </div>
  );
}
