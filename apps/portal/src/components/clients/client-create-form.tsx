import { Button } from "@hezaerd/ui/components/button";
import { Input } from "@hezaerd/ui/components/input";
import { useForm } from "@tanstack/react-form";

import { FieldError } from "@/components/forms/field-error";
import { setFormSubmitError, submitErrorMessage } from "@/lib/tanstack-form";

type ClientCreateFormValues = {
  name: string;
  slug: string;
  contactEmail: string;
};

type ClientCreateFormProps = {
  onCreate: (input: ClientCreateFormValues) => Promise<void>;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function ClientCreateForm({ onCreate }: ClientCreateFormProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      contactEmail: "",
    } satisfies ClientCreateFormValues,
    onSubmit: async ({ value, formApi }) => {
      try {
        await onCreate({
          name: value.name.trim(),
          slug: value.slug.trim(),
          contactEmail: value.contactEmail.trim(),
        });
        formApi.reset();
      } catch (createError) {
        setFormSubmitError(formApi, submitErrorMessage(createError, "Impossible de créer."));
      }
    },
  });

  return (
    <section className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-5">
      <h2 className="font-display text-base font-semibold tracking-tight">Nouveau client</h2>
      <form
        className="grid gap-4 sm:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="name"
          validators={{
            onSubmit: ({ value }) => (value.trim() ? undefined : "Ajoute un nom."),
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                Nom
              </label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field
          name="slug"
          validators={{
            onSubmit: ({ value }) => (value.trim() ? undefined : "Ajoute un slug."),
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                Slug
              </label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="river-cafe"
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field
          name="contactEmail"
          validators={{
            onSubmit: ({ value }) => {
              if (!value.trim()) {
                return "Ajoute un e-mail.";
              }
              if (!isValidEmail(value)) {
                return "E-mail invalide.";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                E-mail de contact
              </label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <div className="flex flex-col gap-2 sm:col-span-3">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Création…" : "Créer le client"}
                </Button>
              </div>
            )}
          </form.Subscribe>
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
