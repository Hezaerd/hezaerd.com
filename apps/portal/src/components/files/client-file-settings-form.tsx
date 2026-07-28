import { api } from "@hezaerd/backend/api";
import { Button } from "@hezaerd/ui/components/button";
import { Input } from "@hezaerd/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";

import { FieldError } from "@/components/forms/field-error";
import {
  DEFAULT_DOWNLOAD_PRESIGN_TTL_MINUTES,
  DEFAULT_MAX_FILE_SIZE_MB,
  DEFAULT_UPLOAD_PRESIGN_TTL_HOURS,
  MAX_DOWNLOAD_PRESIGN_TTL_MINUTES,
  MAX_UPLOAD_PRESIGN_TTL_HOURS,
} from "@/lib/file-settings-constants";
import { resolvePortalFileSettings, type PortalClient } from "@/lib/portal-types";
import { setFormSubmitError, submitErrorMessage } from "@/lib/tanstack-form";

type ClientFileSettingsFormProps = {
  client: PortalClient;
};

type FileSettingsFormValues = {
  defaultMaxFileSizeMb: string;
  uploadPresignTtlHours: string;
  downloadPresignTtlMinutes: string;
};

function createDefaultValues(client: PortalClient): FileSettingsFormValues {
  const defaults = resolvePortalFileSettings(client);
  return {
    defaultMaxFileSizeMb: String(defaults.defaultMaxFileSizeMb),
    uploadPresignTtlHours: String(defaults.uploadPresignTtlHours),
    downloadPresignTtlMinutes: String(defaults.downloadPresignTtlMinutes),
  };
}

function parsePositiveNumber(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export function ClientFileSettingsForm({ client }: ClientFileSettingsFormProps) {
  const updateFileSettings = useMutation(api.clients.updateFileSettings);
  const defaultValues = createDefaultValues(client);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      const parsed = {
        defaultMaxFileSizeMb: parsePositiveNumber(value.defaultMaxFileSizeMb),
        uploadPresignTtlHours: parsePositiveNumber(value.uploadPresignTtlHours),
        downloadPresignTtlMinutes: parsePositiveNumber(value.downloadPresignTtlMinutes),
      };

      if (
        parsed.defaultMaxFileSizeMb === null ||
        parsed.uploadPresignTtlHours === null ||
        parsed.downloadPresignTtlMinutes === null
      ) {
        return;
      }

      const { defaultMaxFileSizeMb, uploadPresignTtlHours, downloadPresignTtlMinutes } = parsed;

      if (uploadPresignTtlHours > MAX_UPLOAD_PRESIGN_TTL_HOURS) {
        formApi.setErrorMap({
          onSubmit: {
            fields: {
              uploadPresignTtlHours: `Maximum ${MAX_UPLOAD_PRESIGN_TTL_HOURS} h.`,
            },
          },
        });
        return;
      }

      if (downloadPresignTtlMinutes > MAX_DOWNLOAD_PRESIGN_TTL_MINUTES) {
        formApi.setErrorMap({
          onSubmit: {
            fields: {
              downloadPresignTtlMinutes: `Maximum ${MAX_DOWNLOAD_PRESIGN_TTL_MINUTES} min.`,
            },
          },
        });
        return;
      }

      try {
        await updateFileSettings({
          slug: client.id,
          defaultMaxFileSizeMb,
          uploadPresignTtlHours,
          downloadPresignTtlMinutes,
        });
        formApi.reset(value);
      } catch (submitError) {
        setFormSubmitError(
          formApi,
          submitErrorMessage(submitError, "Enregistrement impossible."),
        );
      }
    },
  });

  return (
    <section className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-5">
      <div>
        <h3 className="font-display text-base font-semibold tracking-tight">Fichiers</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Défauts pour les nouvelles demandes et durées des liens signés.
        </p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <form.Field
            name="defaultMaxFileSizeMb"
            validators={{
              onSubmit: ({ value }) =>
                parsePositiveNumber(value) === null ? "Valeur invalide." : undefined,
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  Taille max par défaut (Mo)
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  inputMode="numeric"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={String(DEFAULT_MAX_FILE_SIZE_MB)}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="uploadPresignTtlHours"
            validators={{
              onSubmit: ({ value }) => {
                const parsed = parsePositiveNumber(value);
                if (parsed === null) {
                  return "Valeur invalide.";
                }
                if (parsed > MAX_UPLOAD_PRESIGN_TTL_HOURS) {
                  return `Maximum ${MAX_UPLOAD_PRESIGN_TTL_HOURS} h.`;
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  Lien upload (h, max {MAX_UPLOAD_PRESIGN_TTL_HOURS})
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  inputMode="numeric"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={String(DEFAULT_UPLOAD_PRESIGN_TTL_HOURS)}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="downloadPresignTtlMinutes"
            validators={{
              onSubmit: ({ value }) => {
                const parsed = parsePositiveNumber(value);
                if (parsed === null) {
                  return "Valeur invalide.";
                }
                if (parsed > MAX_DOWNLOAD_PRESIGN_TTL_MINUTES) {
                  return `Maximum ${MAX_DOWNLOAD_PRESIGN_TTL_MINUTES} min.`;
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  Lien download (min, max {MAX_DOWNLOAD_PRESIGN_TTL_MINUTES})
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  inputMode="numeric"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={String(DEFAULT_DOWNLOAD_PRESIGN_TTL_MINUTES)}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        </div>

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
    </section>
  );
}
