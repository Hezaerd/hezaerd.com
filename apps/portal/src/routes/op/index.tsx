import { Button } from "@hezaerd/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@hezaerd/ui/components/card";

import { Link, createFileRoute } from "@tanstack/react-router";

import { PracticeCockpit } from "@/components/shell/practice-cockpit";
import { listClients, practiceCockpit } from "@/lib/portal-fixtures";

export const Route = createFileRoute("/op/")({
  component: OperatorHomePage,
});

function OperatorHomePage() {
  const clients = listClients();

  return (
    <div className="flex flex-col gap-8">
      <PracticeCockpit stats={practiceCockpit} />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Clients
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Open a Client Workspace or manage the Client record.
          </p>
        </div>
        <div className="grid gap-3">
          {clients.map((client) => (
            <Card key={client.id} size="sm" className="bg-muted/20">
              <CardHeader className="flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>{client.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {client.contactEmail}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <Link
                        to="/op/clients/$clientId"
                        params={{ clientId: client.id }}
                      />
                    }
                  >
                    Client record
                  </Button>
                  <Button
                    size="sm"
                    render={
                      <Link
                        to="/w/$clientId"
                        params={{ clientId: client.id }}
                      />
                    }
                  >
                    Open workspace
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {client.needsAttention.length} item
                  {client.needsAttention.length === 1 ? "" : "s"} waiting in
                  workspace
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
