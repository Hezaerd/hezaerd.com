import type { Id } from "@hezaerd/backend/dataModel";
import { Badge } from "@hezaerd/ui/components/badge";
import { Button } from "@hezaerd/ui/components/button";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "convex/react";
import { useState } from "react";

import { FileRequestDetailHeader } from "@/components/files/file-request-detail-header";
import { OperatorFileSlotRow } from "@/components/files/operator-file-slot-row";
import { ReasonDialog } from "@/components/files/reason-dialog";
import type { FileRequestEntry } from "@/lib/portal-types";
import { api } from "@hezaerd/backend/api";

type OperatorFileRequestDetailProps = {
  clientId: string;
  entry: FileRequestEntry;
};

export function OperatorFileRequestDetail({ clientId, entry }: OperatorFileRequestDetailProps) {
  const cancelRequest = useMutation(api.files.cancelRequest);
  const removeSlot = useMutation(api.files.removeSlot);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [slotToRemove, setSlotToRemove] = useState<string | null>(null);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <FileRequestDetailHeader
        entry={entry}
        backTo="/op/clients/$clientId/files"
        backParams={{ clientId }}
        backLabel="Fichiers"
      />

      {entry.request.status === "active" ? (
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={() => setCancelOpen(true)}>
            Annuler la demande
          </Button>
        </div>
      ) : (
        <Badge variant="outline">Demande annulée</Badge>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-muted-foreground text-sm font-semibold tracking-wider uppercase">
          Checklist
        </h2>
        <div className="flex flex-col gap-3">
          {entry.slots.map((slot) => (
            <div key={slot._id} className="flex flex-col gap-2">
              <OperatorFileSlotRow slot={slot} />
              {entry.request.status === "active" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="self-start"
                  onClick={() => setSlotToRemove(slot._id)}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                  Retirer ce slot
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <ReasonDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Annuler la demande"
        description="Le client verra ta raison dans « À traiter »."
        confirmLabel="Annuler la demande"
        onConfirm={async (reason) => {
          await cancelRequest({
            requestId: entry.request._id as Id<"fileRequests">,
            reason,
          });
        }}
      />

      <ReasonDialog
        open={slotToRemove !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSlotToRemove(null);
          }
        }}
        title="Retirer un slot"
        description="Le client sera prévenu avec ta raison."
        confirmLabel="Retirer"
        onConfirm={async (reason) => {
          if (!slotToRemove) {
            return;
          }
          await removeSlot({
            slotId: slotToRemove as Id<"fileRequestSlots">,
            reason,
          });
          setSlotToRemove(null);
        }}
      />
    </div>
  );
}
