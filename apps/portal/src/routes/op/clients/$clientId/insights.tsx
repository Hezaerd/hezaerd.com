import { Empty, EmptyHeader, EmptyTitle } from "@hezaerd/ui/components/empty";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/op/clients/$clientId/insights")({
  component: ClientDeskInsightsPage,
});

function ClientDeskInsightsPage() {
  return (
    <Empty className="border-border bg-muted/20 rounded-xl border py-16">
      <EmptyHeader>
        <EmptyTitle className="font-display text-base font-semibold tracking-tight">
          À venir.
        </EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}
