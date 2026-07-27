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
        detail: "Compte créé — liaison du siège en cours ou en attente de connexion.",
        variant: "secondary",
      };
    case "expired":
      return {
        label: "Invitation expirée",
        detail: "Renvoyez une invitation depuis la création client ou le tableau de bord WorkOS.",
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
        detail: "Aucune invitation WorkOS trouvée pour cet e-mail.",
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
      setError(revokeError instanceof Error ? revokeError.message : "Révocation impossible");
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
      setError(deleteError instanceof Error ? deleteError.message : "Suppression impossible");
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading || !status) {
    return (
      <section className="border-border bg-muted/20 rounded-xl border px-5 py-4">
        <p className="text-muted-foreground text-sm">Chargement de l&apos;accès client…</p>
      </section>
    );
  }

  const access = formatAccessStatus(status);

  return (
    <section className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Accès client</p>
          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
            Statut WorkOS et siège Portal pour ce dossier.
          </p>
        </div>
        <Badge variant={access.variant}>{access.label}</Badge>
      </div>
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
        <div>
          <p className="text-sm font-semibold">Supprimer le client</p>
          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
            Supprime le dossier, les factures et le compte WorkOS associé.
          </p>
        </div>
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
                Cette action supprime le client, toutes ses factures et révoque ou supprime
                l&apos;accès WorkOS. Elle est irréversible.
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
    </section>
  );
}
