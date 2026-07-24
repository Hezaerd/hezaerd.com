import {
  ArrowRight01Icon,
  PieChart01Icon,
  Globe02Icon,
  AlertCircleIcon,
  Setting07Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Button } from "@hezaerd/ui/components/button";
import { Switch } from "@hezaerd/ui/components/switch";
import { useState } from "react";

import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import {
  getClient,
  setClientFeature,
  type ClientFeature,
} from "@/lib/portal-fixtures";

export const Route = createFileRoute("/op/clients/$clientId")({
  loader: ({ params }) => {
    const client = getClient(params.clientId);
    if (!client) {
      throw notFound();
    }
    return { clientId: params.clientId };
  },
  component: ClientRecordPage,
});

function getClientInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ClientRecordPage() {
  const { clientId } = Route.useLoaderData();
  const [, refresh] = useState(0);
  const client = getClient(clientId);

  if (!client) {
    return null;
  }

  function toggleFeature(feature: ClientFeature, enabled: boolean) {
    setClientFeature(clientId, feature, enabled);
    refresh((value) => value + 1);
  }

  const initials = getClientInitials(client.name);
  const attentionCount = client.needsAttention.length;

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      {/* Client identity header */}
      <div className="border-border bg-muted/20 flex items-center gap-4 rounded-xl border px-5 py-5">
        <div className="bg-primary/10 border-primary/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
          <span className="text-primary font-mono text-sm font-semibold tracking-wider">
            {initials}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-semibold tracking-tight">
            {client.name}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {client.contactEmail}
          </p>
        </div>
        {attentionCount > 0 && (
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 font-mono text-xs font-semibold text-amber-400">
            <HugeiconsIcon icon={AlertCircleIcon} size={12} />
            {attentionCount} item{attentionCount === 1 ? "" : "s"} waiting
          </div>
        )}
      </div>

      {/* Features section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Setting07Icon} size={14} className="text-muted-foreground" />
          </div>
          <h2 className="font-display text-base font-semibold tracking-tight">
            Features
          </h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Toggle workspace areas beyond Core (Home, Invoices, Files). Changes take effect immediately.
        </p>

        <div className="border-border bg-muted/20 flex flex-col divide-y divide-border overflow-hidden rounded-xl border">
          <FeatureToggleRow
            icon={PieChart01Icon}
            label="Insights"
            description="Visitors, top pages, and one plain-language takeaway."
            checked={client.features.insights}
            onCheckedChange={(checked) => toggleFeature("insights", checked)}
          />
          <FeatureToggleRow
            icon={Globe02Icon}
            label="Website"
            description="Guided editable fields with Preview before Publish."
            checked={client.features.website}
            onCheckedChange={(checked) => toggleFeature("website", checked)}
          />
        </div>
      </section>

      {/* Workspace section */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-base font-semibold tracking-tight">
          Workspace
        </h2>
        <div className="border-border bg-muted/20 flex items-center justify-between gap-4 rounded-xl border px-5 py-4">
          <div>
            <p className="text-sm font-medium">
              Open Client Workspace
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Work in the same areas the client sees.{" "}
              {attentionCount > 0 && (
                <span className="text-amber-400 font-medium">
                  {attentionCount} item{attentionCount === 1 ? "" : "s"} need{attentionCount === 1 ? "s" : ""} attention.
                </span>
              )}
            </p>
          </div>
          <Button
            render={<Link to="/w/$clientId" params={{ clientId: client.id }} />}
          >
            Open workspace
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </Button>
        </div>
      </section>
    </div>
  );
}

function FeatureToggleRow({
  icon,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  icon: IconSvgElement;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
        <HugeiconsIcon icon={icon} size={14} className="text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
