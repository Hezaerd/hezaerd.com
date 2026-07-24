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

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const attentionCount = client.needsAttention.length;

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
          {dateStr}
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Welcome back, {client.name.split(" ")[0]}.
        </h1>
        {attentionCount > 0 ? (
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            You have{" "}
            <span className="text-foreground font-medium">
              {attentionCount} item{attentionCount === 1 ? "" : "s"}
            </span>{" "}
            that need{attentionCount === 1 ? "s" : ""} your attention below.
          </p>
        ) : (
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            Everything&apos;s up to date. Your project is progressing well.
          </p>
        )}
      </div>

      {/* Needs Attention Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold tracking-tight">Needs Attention</h2>
          {attentionCount > 0 && (
            <span className="bg-primary/10 text-primary border-primary/20 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums">
              {attentionCount}
            </span>
          )}
        </div>
        <NeedsAttentionList items={client.needsAttention} />
      </div>
    </div>
  );
}
