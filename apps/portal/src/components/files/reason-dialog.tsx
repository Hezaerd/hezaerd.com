import { Button } from "@hezaerd/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@hezaerd/ui/components/dialog";
import { Textarea } from "@hezaerd/ui/components/textarea";
import { useState } from "react";

type ReasonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: (reason: string) => Promise<void>;
};

export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmer",
  onConfirm,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setError(null);
    if (!reason.trim()) {
      setError("Explique la raison au client.");
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason("");
      onOpenChange(false);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Impossible de continuer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Finalement je peux me débrouiller avec uniquement ce fichier."
          rows={4}
        />
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" disabled={submitting} onClick={() => void handleConfirm()}>
            {submitting ? "Envoi…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
