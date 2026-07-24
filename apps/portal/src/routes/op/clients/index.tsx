import { Button } from "@hezaerd/ui/components/button";
import { AlertCircleIcon, ArrowRight01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Link, createFileRoute } from "@tanstack/react-router";

import { listClients } from "@/lib/portal-fixtures";

export const Route = createFileRoute("/op/clients/")({
  component: ClientDirectoryPage,
});

function getClientInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ClientDirectoryPage() {
  const clients = listClients();

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={UserGroupIcon} size={16} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Clients</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Manage client identities, feature toggles, and workspace access.
        </p>
      </div>

      {/* Client list */}
      <div className="flex flex-col gap-3">
        {clients.map((client) => {
          const initials = getClientInitials(client.name);
          const attentionCount = client.needsAttention.length;
          const featureList = [
            "Core",
            client.features.insights ? "Insights" : null,
            client.features.website ? "Website" : null,
          ].filter(Boolean);

          return (
            <div
              key={client.id}
              className="border-border bg-muted/20 hover:bg-muted/30 group relative flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors"
            >
              {/* Avatar */}
              <div className="bg-primary/10 border-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
                <span className="text-primary font-mono text-xs font-semibold tracking-wider">
                  {initials}
                </span>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-sm font-semibold tracking-tight">{client.name}</p>
                  {attentionCount > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-400">
                      <HugeiconsIcon icon={AlertCircleIcon} size={10} />
                      {attentionCount} waiting
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">{client.contactEmail}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {featureList.map((f) => (
                    <span
                      key={f}
                      className="border-border bg-muted/50 text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  size="sm"
                  render={<Link to="/op/clients/$clientId" params={{ clientId: client.id }} />}
                >
                  View record
                  <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
