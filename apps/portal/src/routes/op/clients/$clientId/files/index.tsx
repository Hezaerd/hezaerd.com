import { api } from "@hezaerd/backend/api";
import { Button } from "@hezaerd/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@hezaerd/ui/components/sheet";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { useState } from "react";

import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { FileRequestCreateForm } from "@/components/files/file-request-create-form";
import { OperatorFileRequestListItem } from "@/components/files/operator-file-request-list-item";
import {
  ClientDeskPage,
  ClientDeskPageHeader,
  DeskSectionHeading,
} from "@/components/shell/client-desk-layout";
import { clientBySlugQuery, fileRequestsDeskQuery } from "@/lib/convex-queries";
import { toPortalClient, type FileRequestEntry } from "@/lib/portal-types";

export const Route = createFileRoute("/op/clients/$clientId/files/")({
  component: ClientDeskFilesPage,
});

function ClientDeskFilesPage() {
  const { clientId } = Route.useParams();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
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
    <ClientDeskPage>
      <ClientDeskPageHeader
        title="Fichiers"
        description={`Demande et reçois les fichiers de ${client.name}.`}
        action={
          <Sheet open={createOpen} onOpenChange={setCreateOpen}>
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              <HugeiconsIcon icon={Add01Icon} size={14} />
              Nouvelle demande
            </Button>
            <SheetContent className="overflow-y-auto sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Nouvelle demande</SheetTitle>
                <SheetDescription>Ce que tu attends du client.</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-4">
                <FileRequestCreateForm
                  client={client}
                  onCreate={async (input) => {
                    const created = await createRequest({
                      slug: clientId,
                      ...input,
                    });
                    setCreateOpen(false);
                    await navigate({
                      to: "/op/clients/$clientId/files/$requestId",
                      params: { clientId, requestId: created.request._id },
                    });
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      <RequestSection
        title="En attente"
        clientId={clientId}
        entries={pending}
        emptyLabel="Aucune demande en cours."
      />
      <RequestSection
        title="Reçues"
        clientId={clientId}
        entries={received}
        emptyLabel="Rien reçu pour l'instant."
      />
    </ClientDeskPage>
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
    <section className="flex flex-col gap-2">
      <DeskSectionHeading title={title} />
      {entries.length === 0 ? (
        <p className="text-muted-foreground py-1 text-sm">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {entries.map((entry) => (
            <OperatorFileRequestListItem key={entry.request._id} clientId={clientId} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
}
