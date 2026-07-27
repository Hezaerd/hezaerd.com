import { api } from "@hezaerd/backend/api";
import { Button } from "@hezaerd/ui/components/button";
import { Input } from "@hezaerd/ui/components/input";
import { ArrowRight01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { useState } from "react";

import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { clientsListQuery } from "@/lib/convex-queries";
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
  const createClient = useMutation(api.clients.create);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const created = await createClient({ name, slug, contactEmail });
      setName("");
      setSlug("");
      setContactEmail("");
      await navigate({
        to: "/op/clients/$clientId",
        params: { clientId: created.slug },
      });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Création impossible");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={UserGroupIcon} size={16} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Clients</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Ouvrez le bureau de chaque client pour gérer son dossier, ses fonctionnalités et son
          activité.
        </p>
      </div>

      <section className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-5">
        <h2 className="font-display text-base font-semibold tracking-tight">Nouveau client</h2>
        <form className="grid gap-4 sm:grid-cols-3" onSubmit={handleCreate}>
          <div className="flex flex-col gap-2">
            <label htmlFor="client-name" className="text-sm font-medium">
              Nom
            </label>
            <Input
              id="client-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="client-slug" className="text-sm font-medium">
              Slug
            </label>
            <Input
              id="client-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="river-cafe"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="client-email" className="text-sm font-medium">
              E-mail de contact
            </label>
            <Input
              id="client-email"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-3 sm:col-span-3">
            <Button type="submit" disabled={submitting}>
              Créer le client
            </Button>
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
          </div>
        </form>
      </section>

      <div className="flex flex-col gap-3">
        {clients.map((clientDoc) => {
          const client = toPortalClient(clientDoc);
          const initials = getClientInitials(client.name);
          const featureList = [
            "Essentiel",
            client.features.insights ? "Statistiques" : null,
            client.features.website ? "Site web" : null,
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
                  Ouvrir le bureau
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
