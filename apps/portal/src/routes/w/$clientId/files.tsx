import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hezaerd/ui/components/empty";
import { File01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";

import { FileRequestListItem } from "@/components/files/file-request-list-item";
import { fileRequestsWorkspaceQuery } from "@/lib/convex-queries";
import type { FileRequestEntry } from "@/lib/portal-types";

export const Route = createFileRoute("/w/$clientId/files")({
  component: ClientFilesPage,
});

function ClientFilesPage() {
  const { clientId } = Route.useParams();
  const { data: requests } = useSuspenseQuery(fileRequestsWorkspaceQuery(clientId));

  const pending = requests.filter((entry) => !entry.isComplete);
  const received = requests.filter((entry) => entry.isComplete);

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={File01Icon} size={16} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Fichiers</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Ouvre une demande pour envoyer ou remplacer tes fichiers.
        </p>
      </div>

      <RequestSection
        title="En attente"
        clientId={clientId}
        entries={pending}
        emptyTitle="Rien à envoyer"
        emptyDescription="Les demandes ouvertes apparaîtront ici."
      />
      <RequestSection
        title="Reçues"
        clientId={clientId}
        entries={received}
        emptyTitle="Aucun envoi terminé"
        emptyDescription="Les demandes complétées restent visibles ici."
      />
    </div>
  );
}

function RequestSection({
  title,
  clientId,
  entries,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  clientId: string;
  entries: FileRequestEntry[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-wider uppercase">
        {title}
      </h2>
      {entries.length === 0 ? (
        <Empty className="border-border bg-muted/20 rounded-xl border py-10">
          <EmptyHeader>
            <EmptyTitle className="font-display text-sm font-semibold tracking-tight">
              {emptyTitle}
            </EmptyTitle>
            <EmptyDescription className="text-muted-foreground text-sm">
              {emptyDescription}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <FileRequestListItem key={entry.request._id} clientId={clientId} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
}
