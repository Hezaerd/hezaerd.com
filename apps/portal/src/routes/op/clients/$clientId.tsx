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

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {client.name}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {client.contactEmail}
        </p>
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
            checked={client.features.insights}
            onCheckedChange={(checked) => toggleFeature("insights", checked)}
          />
          <FeatureToggle
            label="Website"
            description="Guided editable fields with Preview and Publish."
            checked={client.features.website}
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
            {client.needsAttention.length} Needs Attention item
            {client.needsAttention.length === 1 ? "" : "s"} in fixture data.
          </p>
          <Button
            render={<Link to="/w/$clientId" params={{ clientId: client.id }} />}
          >
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
