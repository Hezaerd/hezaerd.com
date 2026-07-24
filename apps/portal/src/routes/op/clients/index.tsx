import { Button } from "@hezaerd/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@hezaerd/ui/components/card";

import { Link, createFileRoute } from "@tanstack/react-router";

import { listClients } from "@/lib/portal-fixtures";

export const Route = createFileRoute("/op/clients/")({
  component: ClientDirectoryPage,
});

function ClientDirectoryPage() {
  const clients = listClients();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Identity, Feature toggles, and workspace entry for each Client.
        </p>
      </div>
      <div className="grid gap-3">
        {clients.map((client) => (
          <Card key={client.id} size="sm" className="bg-muted/20">
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>{client.name}</CardTitle>
                <p className="text-muted-foreground text-sm">{client.contactEmail}</p>
              </div>
              <Button render={<Link to="/op/clients/$clientId" params={{ clientId: client.id }} />}>
                View record
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Features:{" "}
                {[
                  "Core",
                  client.features.insights ? "Insights" : null,
                  client.features.website ? "Website" : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
