import { Button } from "@hezaerd/ui/components/button";
import { DatePicker } from "@hezaerd/ui/components/date-picker";
import { Input } from "@hezaerd/ui/components/input";
import { useForm } from "@tanstack/react-form";

import { FieldError } from "@/components/forms/field-error";
import { parseDateInputValue, parseEuroInputToCents, toDateInputValue } from "@/lib/invoice-format";
import { setFormSubmitError, submitErrorMessage } from "@/lib/tanstack-form";

type InvoiceFormValues = {
  label: string;
  amount: string;
  dueDate: Date | undefined;
};

type InvoiceSubmitMeta = {
  send: boolean;
};

type InvoiceCreateFormProps = {
  onCreate: (input: {
    label: string;
    amountCents: number;
    dueDate?: number;
    send: boolean;
  }) => Promise<void>;
};

const defaultSubmitMeta: InvoiceSubmitMeta = {
  send: true,
};

export function InvoiceCreateForm({ onCreate }: InvoiceCreateFormProps) {
  const form = useForm({
    defaultValues: {
      label: "",
      amount: "",
      dueDate: undefined as Date | undefined,
    } as InvoiceFormValues,
    onSubmitMeta: defaultSubmitMeta,
    onSubmit: async ({ value, meta, formApi }) => {
      const amountCents = parseEuroInputToCents(value.amount);
      if (amountCents === null) {
        return;
      }

      try {
        await onCreate({
          label: value.label.trim(),
          amountCents,
          dueDate: value.dueDate
            ? parseDateInputValue(toDateInputValue(value.dueDate.getTime()))
            : undefined,
          send: meta.send,
        });
        formApi.reset();
      } catch (createError) {
        setFormSubmitError(formApi, submitErrorMessage(createError, "Impossible de créer."));
      }
    },
  });

  return (
    <section className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-5">
      <h3 className="font-display text-base font-semibold tracking-tight">Nouvelle facture</h3>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <form.Field
            name="label"
            validators={{
              onSubmit: ({ value }) => (value.trim() ? undefined : "Ajoute un libellé."),
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  Libellé
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Forfait mensuel"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="amount"
            validators={{
              onSubmit: ({ value }) =>
                parseEuroInputToCents(value) === null ? "Montant invalide." : undefined,
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  Montant (€)
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  inputMode="decimal"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="2400"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field name="dueDate">
            {(field) => (
              <div className="flex flex-col gap-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  Échéance
                </label>
                <DatePicker
                  id={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                  placeholder="jj/mm/aaaa"
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <>
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void form.handleSubmit({ send: true })}
                  >
                    {isSubmitting ? "Envoi…" : "Créer et envoyer"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => void form.handleSubmit({ send: false })}
                  >
                    {isSubmitting ? "Enregistrement…" : "Enregistrer brouillon"}
                  </Button>
                </>
              )}
            </form.Subscribe>
          </div>
          <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
            {(submitError) =>
              submitError ? <p className="text-destructive text-sm">{String(submitError)}</p> : null
            }
          </form.Subscribe>
        </div>
      </form>
    </section>
  );
}
