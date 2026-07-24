import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hezaerd/ui/components/empty";
import { Invoice01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/op/invoices")({
  component: OperatorInvoicesPage,
});

function OperatorInvoicesPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Invoice01Icon} size={16} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Factures</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Liste des factures et envoi — bientôt disponible.
        </p>
      </div>

      <Empty className="border-border bg-muted/20 rounded-xl border py-12">
        <EmptyHeader>
          <EmptyTitle className="font-display text-base font-semibold tracking-tight">
            Bientôt disponible
          </EmptyTitle>
          <EmptyDescription className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            Suivez les factures ouvertes et payées de tous vos clients au même endroit. En
            attendant, ouvrez les espaces clients individuels.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
