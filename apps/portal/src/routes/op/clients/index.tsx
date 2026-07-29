import { api } from "@hezaerd/backend/api";
import { Button } from "@hezaerd/ui/components/button";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAction } from "convex/react";

import { Link, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";

import { useLayoutEffect, useMemo, useState } from "react";

import { ClientCreateForm } from "@/components/clients/client-create-form";
import { existingContactEmailSet } from "@/lib/client-email";
import { clientsListQuery } from "@/lib/convex-queries";
import { consumePaletteHandoff } from "@/lib/palette-handoff";
import { toPortalClient } from "@/lib/portal-types";

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
  const { data: clients } = useSuspenseQuery(clientsListQuery);
  const createClient = useAction(api.clients.create);
  const navigate = useNavigate();
  const locationKey = useRouterState({
    select: (state) => state.location.state.key ?? state.location.href,
  });
  const [initialContactEmail, setInitialContactEmail] = useState<string | undefined>();
  const existingContactEmails = useMemo(
    () => existingContactEmailSet(clients.map(toPortalClient)),
    [clients],
  );

  useLayoutEffect(() => {
    const handoff = consumePaletteHandoff();
    if (handoff?.type === "new-client") {
      setInitialContactEmail(handoff.contactEmail);
      return;
    }

    setInitialContactEmail(undefined);
  }, [locationKey]);

  return (
    <div className="flex flex-col gap-8">
      <ClientCreateForm
        key={initialContactEmail ?? "empty"}
        initialContactEmail={initialContactEmail}
        existingContactEmails={existingContactEmails}
        onCreate={async (input) => {
          const created = await createClient(input);
          await navigate({
            to: "/op/clients/$clientId",
            params: { clientId: created.slug },
          });
        }}
      />

      <div className="flex flex-col gap-3">
        {clients.map((clientDoc) => {
          const client = toPortalClient(clientDoc);
          const initials = getClientInitials(client.name);
          const featureList = [
            "Essentiel",
            client.features.insights ? "Statistiques" : null,
          ].filter(Boolean);

          return (
            <div
              key={client.id}
              className="border-border bg-muted/20 hover:bg-muted/30 group relative flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors"
            >
              <div className="bg-primary/10 border-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
                <span className="text-primary font-mono text-xs font-semibold tracking-wider">
                  {initials}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold tracking-tight">{client.name}</p>
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

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  size="sm"
                  render={<Link to="/op/clients/$clientId" params={{ clientId: client.id }} />}
                >
                  Ouvrir
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
