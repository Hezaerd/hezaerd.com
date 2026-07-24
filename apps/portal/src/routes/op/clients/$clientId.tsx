import type { ClientFeature, NeedsAttentionItem } from "@/lib/portal-fixtures";

import { Button } from "@hezaerd/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@hezaerd/ui/components/card";
import { Switch } from "@hezaerd/ui/components/switch";
import { useState } from "react";

import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { getClient } from "@/lib/portal-fixtures";

export const Route = createFileRoute("/op/clients/$clientId")({
  loader: ({ params }) => {
    const client = getClient(params.clientId);
    if (!client) {
      throw notFound();
    }
    return { client };
  },
  component: ClientRecordPage,
});

function ClientRecordPage() {
  const { client: initialClient } = Route.useLoaderData();
  const [features, setFeatures] = useState(initialClient.features);
  const [needsAttention, setNeedsAttention] = useState(initialClient.needsAttention);

  function toggleFeature(feature: ClientFeature, enabled: boolean) {
    setFeatures((current) => ({ ...current, [feature]: enabled }));

    if (enabled) {
      const unlock: NeedsAttentionItem = {
        id: `${initialClient.id}-${feature}-unlock`,
        title:
          feature === "website" ? "Website is ready to explore" : "Insights is ready to explore",
        description:
          feature === "website"
            ? "Review editable fields and publish when you are ready."
            : "See visitors, top pages, and one plain-language takeaway.",
        clientId: initialClient.id,
        area: feature,
        kind: "feature",
      };
      setNeedsAttention((current) =>
        current.some((item) => item.id === unlock.id) ? current : [...current, unlock],
      );
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{initialClient.name}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{initialClient.contactEmail}</p>
      </div>

      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            Toggle Client Workspace Areas beyond Core (Home, Invoices, Files).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FeatureToggle
            label="Insights"
            description="Visitors, top pages, and one takeaway."
            checked={features.insights}
            onCheckedChange={(checked) => toggleFeature("insights", checked)}
          />
          <FeatureToggle
            label="Website"
            description="Guided editable fields with Preview and Publish."
            checked={features.website}
            onCheckedChange={(checked) => toggleFeature("website", checked)}
          />
        </CardContent>
      </Card>

      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>
            Open the Client Workspace to work in the same Areas the Client sees.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            {needsAttention.length} Needs Attention item
            {needsAttention.length === 1 ? "" : "s"} in fixture data.
          </p>
          <Button render={<Link to="/w/$clientId" params={{ clientId: initialClient.id }} />}>
            Open workspace
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureToggle({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
