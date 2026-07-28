import { Button } from "@hezaerd/ui/components/button";
import { Input } from "@hezaerd/ui/components/input";
import { Textarea } from "@hezaerd/ui/components/textarea";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { ExtensionTagsInput } from "@/components/files/extension-tags-input";
import { FieldError } from "@/components/forms/field-error";
import { resolvePortalFileSettings, type PortalClient } from "@/lib/portal-types";
import { setFormSubmitError, submitErrorMessage } from "@/lib/tanstack-form";

type SlotDraft = {
  label: string;
  allowedExtensions: string[];
};

type FileRequestFormValues = {
  title: string;
  instructions: string;
  maxFileSizeMb: string;
  slots: SlotDraft[];
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

function createDefaultSlot(): SlotDraft {
  return {
    label: "",
    allowedExtensions: ["svg", "ai", "eps"],
  };
}

function createDefaultValues(defaultMaxFileSizeMb: number): FileRequestFormValues {
  return {
    title: "",
    instructions: "",
    maxFileSizeMb: String(defaultMaxFileSizeMb),
    slots: [createDefaultSlot()],
  };
}

export function FileRequestCreateForm({ client, onCreate }: FileRequestCreateFormProps) {
  const defaults = resolvePortalFileSettings(client);
  const defaultValues = createDefaultValues(defaults.defaultMaxFileSizeMb);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      try {
        const parsedMax = Number(value.maxFileSizeMb);
        await onCreate({
          title: value.title.trim(),
          instructions: value.instructions.trim() || undefined,
          maxFileSizeMb: parsedMax,
          slots: value.slots.map((slot) => ({
            label: slot.label.trim(),
            allowedExtensions: slot.allowedExtensions,
          })),
        });
        formApi.reset();
        setShowAdvanced(false);
      } catch (createError) {
        setFormSubmitError(
          formApi,
          submitErrorMessage(createError, "Impossible de créer."),
        );
      }
    },
  });

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-4">
        <form.Field
          name="title"
          validators={{
            onSubmit: ({ value }) => (value.trim() ? undefined : "Ajoute un titre."),
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                Titre
              </label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Kit brand"
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field name="instructions">
          {(field) => (
            <div className="flex flex-col gap-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                Consignes <span className="text-muted-foreground font-normal">(optionnel)</span>
              </label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Si tu n'as pas le vectoriel, une photo nette du logo imprimé suffit."
                rows={3}
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Fichiers attendus</p>
        <form.Field name="slots" mode="array">
          {(slotsField) => (
            <>
              <div className="border-border divide-border divide-y rounded-lg border">
                {slotsField.state.value.map((_, index) => (
                  <div key={index} className="flex flex-col gap-3 p-3">
                    <div className="flex items-center gap-2">
                      <form.Field
                        name={`slots[${index}].label`}
                        validators={{
                          onSubmit: ({ value }) =>
                            value.trim() ? undefined : "Chaque fichier attendu doit avoir un nom.",
                        }}
                      >
                        {(field) => (
                          <div className="min-w-0 flex-1">
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              placeholder="Logo SVG"
                            />
                            <FieldError errors={field.state.meta.errors} />
                          </div>
                        )}
                      </form.Field>
                      {slotsField.state.value.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Retirer ce fichier"
                          onClick={() => slotsField.removeValue(index)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={14} />
                        </Button>
                      ) : null}
                    </div>
                    <form.Field name={`slots[${index}].allowedExtensions`}>
                      {(field) => (
                        <ExtensionTagsInput
                          value={field.state.value}
                          onChange={field.handleChange}
                        />
                      )}
                    </form.Field>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => slotsField.pushValue(createDefaultSlot())}
              >
                <HugeiconsIcon icon={Add01Icon} size={14} />
                Ajouter un fichier
              </Button>
            </>
          )}
        </form.Field>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground self-start text-sm transition-colors"
          onClick={() => setShowAdvanced((current) => !current)}
        >
          {showAdvanced ? "Masquer les options" : "Options avancées"}
        </button>
        {showAdvanced ? (
          <form.Field
            name="maxFileSizeMb"
            validators={{
              onSubmit: ({ value }) => {
                const parsedMax = Number(value);
                if (!Number.isFinite(parsedMax) || parsedMax <= 0) {
                  return "Taille max invalide.";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  Taille max par fichier (Mo)
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  inputMode="numeric"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className="max-w-[8rem]"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Envoi…" : "Envoyer la demande"}
            </Button>
          )}
        </form.Subscribe>
        <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
          {(submitError) =>
            submitError ? <p className="text-destructive text-sm">{String(submitError)}</p> : null
          }
        </form.Subscribe>
      </div>
    </form>
  );
}
