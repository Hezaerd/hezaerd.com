import { Button } from "@hezaerd/ui/components/button";
import { DatePicker } from "@hezaerd/ui/components/date-picker";
import { Input } from "@hezaerd/ui/components/input";
import { useState } from "react";

import { parseDateInputValue, parseEuroInputToCents, toDateInputValue } from "@/lib/invoice-format";

type InvoiceCreateFormProps = {
  onCreate: (input: {
    label: string;
    amountCents: number;
    dueDate?: number;
    send: boolean;
  }) => Promise<void>;
};

export function InvoiceCreateForm({ onCreate }: InvoiceCreateFormProps) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"draft" | "send" | null>(null);

  async function handleSubmit(send: boolean) {
    setError(null);
    const amountCents = parseEuroInputToCents(amount);
    if (!label.trim()) {
      setError("Ajoute un libellé.");
      return;
    }
    if (amountCents === null) {
      setError("Montant invalide.");
      return;
    }

    setSubmitting(send ? "send" : "draft");
    try {
      await onCreate({
        label: label.trim(),
        amountCents,
        dueDate: dueDate ? parseDateInputValue(toDateInputValue(dueDate.getTime())) : undefined,
        send,
      });
      setLabel("");
      setAmount("");
      setDueDate(undefined);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Impossible de créer.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <section className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-5">
      <h3 className="font-display text-base font-semibold tracking-tight">Nouvelle facture</h3>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="invoice-label" className="text-sm font-medium">
            Libellé
          </label>
          <Input
            id="invoice-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Forfait mensuel"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="invoice-amount" className="text-sm font-medium">
            Montant (€)
          </label>
          <Input
            id="invoice-amount"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="2400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="invoice-due-date" className="text-sm font-medium">
            Échéance
          </label>
          <DatePicker
            id="invoice-due-date"
            value={dueDate}
            onChange={setDueDate}
            placeholder="jj/mm/aaaa"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={submitting !== null}
          onClick={() => void handleSubmit(true)}
        >
          {submitting === "send" ? "Envoi…" : "Créer et envoyer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting !== null}
          onClick={() => void handleSubmit(false)}
        >
          {submitting === "draft" ? "Enregistrement…" : "Enregistrer brouillon"}
        </Button>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>
    </section>
  );
}
