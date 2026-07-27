import { Button } from "@hezaerd/ui/components/button";
import { Input } from "@hezaerd/ui/components/input";
import { Textarea } from "@hezaerd/ui/components/textarea";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import {
  ExtensionTagsInput,
  formatExtensionsLabel,
} from "@/components/files/extension-tags-input";
import { resolvePortalFileSettings, type PortalClient } from "@/lib/portal-types";

type SlotDraft = {
  key: string;
  label: string;
  allowedExtensions: string[];
};

type FileRequestCreateFormProps = {
  client: PortalClient;
  onCreate: (input: {
    title: string;
    instructions?: string;
    maxFileSizeMb: number;
    slots: Array<{ label: string; allowedExtensions: string[] }>;
  }) => Promise<void>;
};

function newSlot(): SlotDraft {
  return {
    key: crypto.randomUUID(),
    label: "",
    allowedExtensions: ["svg", "ai", "eps"],
  };
}

export function FileRequestCreateForm({ client, onCreate }: FileRequestCreateFormProps) {
  const defaults = resolvePortalFileSettings(client);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(String(defaults.defaultMaxFileSizeMb));
  const [slots, setSlots] = useState<SlotDraft[]>([newSlot()]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    const parsedMax = Number(maxFileSizeMb);
    if (!title.trim()) {
      setError("Ajoute un titre.");
      return;
    }
    if (!Number.isFinite(parsedMax) || parsedMax <= 0) {
      setError("Taille max invalide.");
      return;
    }
    if (slots.some((slot) => !slot.label.trim())) {
      setError("Chaque slot doit avoir un label.");
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        instructions: instructions.trim() || undefined,
        maxFileSizeMb: parsedMax,
        slots: slots.map((slot) => ({
          label: slot.label.trim(),
          allowedExtensions: slot.allowedExtensions,
        })),
      });
      setTitle("");
      setInstructions("");
      setMaxFileSizeMb(String(defaults.defaultMaxFileSizeMb));
      setSlots([newSlot()]);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Impossible de créer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-5">
      <h3 className="font-display text-base font-semibold tracking-tight">Nouvelle demande</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="file-request-title" className="text-sm font-medium">
            Titre
          </label>
          <Input
            id="file-request-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Kit brand"
          />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="file-request-instructions" className="text-sm font-medium">
            Consignes (optionnel)
          </label>
          <Textarea
            id="file-request-instructions"
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="Si tu n'as pas le vectoriel, une photo nette du logo imprimé suffit."
            rows={3}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="file-request-max-size" className="text-sm font-medium">
            Taille max par fichier (Mo)
          </label>
          <Input
            id="file-request-max-size"
            inputMode="numeric"
            value={maxFileSizeMb}
            onChange={(event) => setMaxFileSizeMb(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Fichiers attendus</p>
        {slots.map((slot, index) => (
          <div key={slot.key} className="border-border bg-background/60 flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Slot {index + 1}</p>
              {slots.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSlots((current) => current.filter((item) => item.key !== slot.key))}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </Button>
              ) : null}
            </div>
            <Input
              value={slot.label}
              onChange={(event) =>
                setSlots((current) =>
                  current.map((item) =>
                    item.key === slot.key ? { ...item, label: event.target.value } : item,
                  ),
                )
              }
              placeholder="Logo SVG"
            />
            <ExtensionTagsInput
              value={slot.allowedExtensions}
              onChange={(allowedExtensions) =>
                setSlots((current) =>
                  current.map((item) =>
                    item.key === slot.key ? { ...item, allowedExtensions } : item,
                  ),
                )
              }
            />
            <p className="text-muted-foreground text-xs">
              Accepté : {formatExtensionsLabel(slot.allowedExtensions)}
            </p>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setSlots((current) => [...current, newSlot()])}
        >
          <HugeiconsIcon icon={Add01Icon} size={14} />
          Ajouter un fichier
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" disabled={submitting} onClick={() => void handleSubmit()}>
          {submitting ? "Envoi…" : "Envoyer la demande"}
        </Button>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>
    </section>
  );
}
