import { api } from "@hezaerd/backend/api";
import { Empty, EmptyHeader, EmptyTitle } from "@hezaerd/ui/components/empty";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";

import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { FileRequestCreateForm } from "@/components/files/file-request-create-form";
import { OperatorFileRequestListItem } from "@/components/files/operator-file-request-list-item";
import { clientBySlugQuery, fileRequestsDeskQuery } from "@/lib/convex-queries";
import { toPortalClient, type FileRequestEntry } from "@/lib/portal-types";

export const Route = createFileRoute("/op/clients/$clientId/files")({
  component: ClientDeskFilesPage,
});

function ClientDeskFilesPage() {
  const { clientId } = Route.useParams();
  const navigate = useNavigate();
  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));
  const { data: requests } = useSuspenseQuery(fileRequestsDeskQuery(clientId));
  const createRequest = useMutation(api.files.createRequest);

  if (clientDoc === null) {
    return null;
  }

  const client = toPortalClient(clientDoc);
  const activeRequests = requests.filter((entry) => entry.request.status === "active");
  const pending = activeRequests.filter((entry) => !entry.isComplete);
  const received = activeRequests.filter((entry) => entry.isComplete);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <FileRequestCreateForm
        client={client}
        onCreate={async (input) => {
          const created = await createRequest({
            slug: clientId,
            ...input,
          });
          await navigate({
            to: "/op/clients/$clientId/files/$requestId",
            params: { clientId, requestId: created.request._id },
          });
        }}
      />

      <RequestSection title="En attente" clientId={clientId} entries={pending} emptyLabel="Aucune demande en cours." />
      <RequestSection title="Reçues" clientId={clientId} entries={received} emptyLabel="Rien reçu pour l'instant." />
    </div>
  );
}

function RequestSection({
  title,
  clientId,
  entries,
  emptyLabel,
}: {
  title: string;
  clientId: string;
  entries: FileRequestEntry[];
  emptyLabel: string;
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
              {emptyLabel}
            </EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <OperatorFileRequestListItem key={entry.request._id} clientId={clientId} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
}
