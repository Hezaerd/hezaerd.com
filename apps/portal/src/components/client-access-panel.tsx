import { api } from "@hezaerd/backend/api";
import { Badge } from "@hezaerd/ui/components/badge";
import { Button } from "@hezaerd/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@hezaerd/ui/components/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAction } from "convex/react";
import { useState } from "react";

import { clientsListQuery } from "@/lib/convex-queries";
import { DeskCard, DeskCardHeader } from "@/components/shell/client-desk-layout";

type ClientAccessStatus = typeof api.clientInvites.getAccessStatus._returnType;

function clientAccessQueryKey(slug: string) {
  return ["client-access", slug] as const;
}

function formatAccessStatus(status: ClientAccessStatus): {
  label: string;
  detail: string;
  variant: "default" | "secondary" | "outline" | "destructive";
} {
  switch (status.kind) {
    case "connected":
      return {
        label: "Connecté",
        detail: `${status.userName} (${status.userEmail})`,
        variant: "default",
      };
    case "pending":
      return {
        label: "Invitation en attente",
        detail: `Expire le ${new Date(status.expiresAt).toLocaleDateString("fr-CA", {
          dateStyle: "medium",
        })}`,
        variant: "secondary",
      };
    case "accepted":
      return {
        label: "Invitation acceptée",
        detail: "Compte créé — en attente de connexion.",
        variant: "secondary",
      };
    case "expired":
      return {
        label: "Invitation expirée",
        detail: "Renvoie une invitation depuis la création client.",
        variant: "outline",
      };
    case "revoked":
      return {
        label: "Invitation révoquée",
        detail: "Aucun accès actif pour cet e-mail.",
        variant: "destructive",
      };
    case "none":
      return {
        label: "Aucune invitation",
        detail: "Aucune invitation trouvée pour cet e-mail.",
        variant: "outline",
      };
  }
}

export function ClientAccessPanel({
  clientSlug,
  clientName,
}: {
  clientSlug: string;
  clientName: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getAccessStatus = useAction(api.clientInvites.getAccessStatus);
  const revokeInvite = useAction(api.clientInvites.revoke);
  const deleteClient = useAction(api.clients.deleteClient);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: clientAccessQueryKey(clientSlug),
    queryFn: () => getAccessStatus({ slug: clientSlug }),
  });

  async function handleRevoke() {
    setError(null);
    setRevoking(true);
    try {
      const nextStatus = await revokeInvite({ slug: clientSlug });
      queryClient.setQueryData(clientAccessQueryKey(clientSlug), nextStatus);
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Impossible de révoquer.");
    } finally {
      setRevoking(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    try {
      await deleteClient({ slug: clientSlug });
      await queryClient.invalidateQueries({ queryKey: clientsListQuery.queryKey });
      setDeleteDialogOpen(false);
      await navigate({ to: "/op/clients" });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Impossible de supprimer.");
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading || !status) {
    return (
      <DeskCard>
        <p className="text-muted-foreground text-sm">Chargement…</p>
      </DeskCard>
    );
  }

  const access = formatAccessStatus(status);

  return (
    <DeskCard>
      <DeskCardHeader
        title="Accès Portal"
        action={<Badge variant={access.variant}>{access.label}</Badge>}
      />
      <p className="text-muted-foreground text-sm leading-relaxed">{access.detail}</p>
      {status.kind === "pending" ? (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={revoking || deleting}
            onClick={() => void handleRevoke()}
          >
            {revoking ? "Révocation…" : "Révoquer l'invitation"}
          </Button>
        </div>
      ) : null}

      <div className="border-border flex flex-col gap-3 border-t pt-4">
        <p className="text-sm font-semibold">Supprimer le client</p>
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger
            render={
              <Button type="button" size="sm" variant="destructive" disabled={deleting}>
                Supprimer {clientName}
              </Button>
            }
          />
          <DialogContent showCloseButton={!deleting}>
            <DialogHeader>
              <DialogTitle>Supprimer {clientName} ?</DialogTitle>
              <DialogDescription>
                Tu perds le dossier, les factures et l&apos;accès Portal. Irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={() => setDeleteDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleting}
                onClick={() => void handleDelete()}
              >
                {deleting ? "Suppression…" : "Confirmer la suppression"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </DeskCard>
  );
}
