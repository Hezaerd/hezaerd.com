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
import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";

import { FieldError } from "@/components/forms/field-error";
import { setFormSubmitError, submitErrorMessage } from "@/lib/tanstack-form";

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
  const form = useForm({
    defaultValues: {
      reason: "",
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await onConfirm(value.reason.trim());
        formApi.reset();
        onOpenChange(false);
      } catch (confirmError) {
        setFormSubmitError(
          formApi,
          submitErrorMessage(confirmError, "Impossible de continuer."),
        );
      }
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="reason"
            validators={{
              onSubmit: ({ value }) =>
                value.trim() ? undefined : "Explique la raison au client.",
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Finalement je peux me débrouiller avec uniquement ce fichier."
                  rows={4}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
          <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
            {(submitError) =>
              submitError ? <p className="text-destructive text-sm">{String(submitError)}</p> : null
            }
          </form.Subscribe>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Envoi…" : confirmLabel}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
