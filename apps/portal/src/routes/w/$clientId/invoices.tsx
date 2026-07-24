import { Button } from "@hezaerd/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@hezaerd/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hezaerd/ui/components/empty";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/w/$clientId/invoices")({
  component: ClientInvoicesPage,
});

function ClientInvoicesPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Unpaid invoices lead. Paid history stays secondary.
        </p>
      </div>
      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle>Invoice #1042</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">Monthly retainer — $2,400 due in 5 days.</p>
          <Button>Pay invoice</Button>
        </CardContent>
      </Card>
      <Empty className="border-border bg-muted/20 border">
        <EmptyHeader>
          <EmptyTitle>Paid history</EmptyTitle>
          <EmptyDescription>Earlier paid invoices will appear here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
