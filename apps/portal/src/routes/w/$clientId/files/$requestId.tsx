import { Empty, EmptyHeader, EmptyTitle } from "@hezaerd/ui/components/empty";
import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute, notFound } from "@tanstack/react-router";

import { FileRequestDetailHeader } from "@/components/files/file-request-detail-header";
import { FileSlotDropzone } from "@/components/files/file-slot-dropzone";
import { fileRequestQuery } from "@/lib/convex-queries";

export const Route = createFileRoute("/w/$clientId/files/$requestId")({
  component: ClientFileRequestPage,
});

function ClientFileRequestPage() {
  const { clientId, requestId } = Route.useParams();
  const { data: entry } = useSuspenseQuery(fileRequestQuery(clientId, requestId));

  if (entry === null) {
    throw notFound();
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <FileRequestDetailHeader
        entry={entry}
        backTo="/w/$clientId/files"
        backParams={{ clientId }}
        backLabel="Fichiers"
      />

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-wider uppercase">
          À envoyer
        </h2>
        {entry.slots.length === 0 ? (
          <Empty className="border-border bg-muted/20 rounded-xl border py-10">
            <EmptyHeader>
              <EmptyTitle className="font-display text-sm font-semibold tracking-tight">
                Aucun fichier listé
              </EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          entry.slots.map((slot) => (
            <FileSlotDropzone
              key={slot._id}
              slot={slot}
              maxFileSizeMb={entry.request.maxFileSizeMb}
            />
          ))
        )}
      </section>
    </div>
  );
}
