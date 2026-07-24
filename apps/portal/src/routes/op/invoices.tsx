import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hezaerd/ui/components/empty";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/op/invoices")({
  component: OperatorInvoicesPage,
});

function OperatorInvoicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Practice-wide invoice list and send flow will land here.
        </p>
      </div>
      <Empty className="border-border bg-muted/20 border">
        <EmptyHeader>
          <EmptyTitle>Practice invoices — coming soon</EmptyTitle>
          <EmptyDescription>
            Track open and paid invoices across Clients from Operator Home.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
