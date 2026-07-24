import { createFileRoute } from "@tanstack/react-router";

import { NeedsAttentionList } from "@/components/shell/needs-attention-list";
import { getClient } from "@/lib/portal-fixtures";

export const Route = createFileRoute("/w/$clientId/")({
  component: ClientHomePage,
});

function ClientHomePage() {
  const { clientId } = Route.useParams();
  const client = getClient(clientId);

  if (!client) {
    return null;
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Home
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Needs Attention only — tap through to the relevant Area.
        </p>
      </div>
      <NeedsAttentionList items={client.needsAttention} />
    </div>
  );
}
