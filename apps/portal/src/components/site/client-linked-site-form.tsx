import { api } from "@hezaerd/backend/api";
import { Button } from "@hezaerd/ui/components/button";
import { Input } from "@hezaerd/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";

import { FieldError } from "@/components/forms/field-error";
import { DeskCard, DeskCardHeader } from "@/components/shell/client-desk-layout";
import type { PortalClient } from "@/lib/portal-types";
import { setFormSubmitError, submitErrorMessage } from "@/lib/tanstack-form";

type ClientLinkedSiteFormProps = {
  client: PortalClient;
};

type LinkedSiteFormValues = {
  productionUrl: string;
  githubRepo: string;
};

function createDefaultValues(client: PortalClient): LinkedSiteFormValues {
  return {
    productionUrl: client.linkedSite?.productionUrl ?? "",
    githubRepo: client.linkedSite?.githubRepo ?? "",
  };
}

export function ClientLinkedSiteForm({ client }: ClientLinkedSiteFormProps) {
  const updateLinkedSite = useMutation(api.clients.updateLinkedSite);
  const defaultValues = createDefaultValues(client);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      try {
        await updateLinkedSite({
          slug: client.id,
          productionUrl: value.productionUrl,
          githubRepo: value.githubRepo.trim() || undefined,
        });
        formApi.reset(value);
      } catch (submitError) {
        setFormSubmitError(formApi, submitErrorMessage(submitError, "Enregistrement impossible."));
      }
    },
  });

  return (
    <DeskCard>
      <DeskCardHeader
        title="Site public"
        description="URL de la landing client. Active l'aperçu live sur le Bureau."
      />

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="productionUrl"
          validators={{
            onSubmit: ({ value }) => {
              const trimmed = value.trim();
              if (!trimmed) {
                return undefined;
              }
              try {
                const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
                new URL(withProtocol);
                return undefined;
              } catch {
                return "URL invalide.";
              }
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                URL de production
              </label>
              <Input
                id={field.name}
                name={field.name}
                type="url"
                inputMode="url"
                autoComplete="url"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="https://exemple.com"
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field name="githubRepo">
          {(field) => (
            <div className="flex flex-col gap-2">
              <label htmlFor={field.name} className="text-sm font-medium">
                Repo GitHub <span className="text-muted-foreground font-normal">(optionnel)</span>
              </label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="org/repo"
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <div className="flex flex-col gap-2">
          <form.Subscribe
            selector={(state) => ({
              isDirty: state.isDirty,
              isSubmitting: state.isSubmitting,
              isSubmitted: state.isSubmitted,
              canSubmit: state.canSubmit,
            })}
          >
            {({ isDirty, isSubmitting, isSubmitted, canSubmit }) => (
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={!isDirty || isSubmitting || !canSubmit}>
                  {isSubmitting ? "Enregistrement…" : "Enregistrer"}
                </Button>
                {!isDirty && isSubmitted && !isSubmitting ? (
                  <p className="text-muted-foreground text-sm">Enregistré.</p>
                ) : null}
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
    </DeskCard>
  );
}
