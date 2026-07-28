import { api } from "@hezaerd/backend/api";
import { Button } from "@hezaerd/ui/components/button";
import { Input } from "@hezaerd/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { useAction, useMutation } from "convex/react";
import { useState } from "react";

import { FieldError } from "@/components/forms/field-error";
import { type PortalClient, hasLinkedSite } from "@/lib/portal-types";
import { setFormSubmitError, submitErrorMessage } from "@/lib/tanstack-form";

type LinkedSiteSettingsPanelProps = {
  client: PortalClient;
  hasActiveDeployToken: boolean;
};

type LinkedSiteFormValues = {
  githubRepo: string;
  defaultBranch: string;
  productionUrl: string;
};

function createDefaultValues(client: PortalClient): LinkedSiteFormValues {
  return {
    githubRepo: client.linkedSite?.githubRepo ?? "",
    defaultBranch: client.linkedSite?.defaultBranch ?? "master",
    productionUrl: client.linkedSite?.productionUrl ?? "",
  };
}

export function LinkedSiteSettingsPanel({
  client,
  hasActiveDeployToken,
}: LinkedSiteSettingsPanelProps) {
  const updateLinkedSite = useMutation(api.sites.updateLinkedSite);
  const clearLinkedSite = useMutation(api.sites.clearLinkedSite);
  const issueDeployToken = useAction(api.sites.issueDeployToken);
  const revokeDeployToken = useMutation(api.sites.revokeDeployToken);

  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [tokenBusy, setTokenBusy] = useState(false);
  const [clearBusy, setClearBusy] = useState(false);

  const linked = hasLinkedSite(client);
  const defaultValues = createDefaultValues(client);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      const githubRepo = value.githubRepo.trim();
      const defaultBranch = value.defaultBranch.trim();
      const productionUrl = value.productionUrl.trim();

      if (!githubRepo || !defaultBranch || !productionUrl) {
        formApi.setErrorMap({
          onSubmit: {
            form: "Tous les champs sont requis.",
            fields: {},
          },
        });
        return;
      }

      try {
        await updateLinkedSite({
          slug: client.id,
          githubRepo,
          defaultBranch,
          productionUrl,
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

  async function handleIssueToken() {
    setTokenBusy(true);
    setIssuedToken(null);
    try {
      const result = await issueDeployToken({ slug: client.id });
      setIssuedToken(result.token);
    } catch (error) {
      console.error(error);
    } finally {
      setTokenBusy(false);
    }
  }

  async function handleRevokeToken() {
    setTokenBusy(true);
    try {
      await revokeDeployToken({ slug: client.id });
      setIssuedToken(null);
    } catch (error) {
      console.error(error);
    } finally {
      setTokenBusy(false);
    }
  }

  async function handleClearLinkedSite() {
    if (!window.confirm("Retirer le site lié et effacer les données de pilotage ?")) {
      return;
    }
    setClearBusy(true);
    try {
      await clearLinkedSite({ slug: client.id });
      form.reset(createDefaultValues({ ...client, linkedSite: undefined }));
      setIssuedToken(null);
    } catch (error) {
      console.error(error);
    } finally {
      setClearBusy(false);
    }
  }

  return (
    <section className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-5">
      <div>
        <h3 className="font-display text-base font-semibold tracking-tight">Site lié</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Repo GitHub, URL prod et token CI pour le pilotage depuis le Desk.
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
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="githubRepo">
            {(field) => (
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  Repo GitHub
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="org/mon-client"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field name="defaultBranch">
            {(field) => (
              <div className="flex flex-col gap-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  Branche
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="master"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field name="productionUrl">
            {(field) => (
              <div className="flex flex-col gap-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  URL de production
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="https://example.com"
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
                  {isSubmitting ? "Enregistrement…" : linked ? "Mettre à jour" : "Lier le site"}
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

      {linked ? (
        <div className="border-border flex flex-col gap-3 border-t pt-4">
          <div>
            <p className="text-sm font-medium">Token deploy CI</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Secret repo GitHub{" "}
              <span className="font-mono">PORTAL_DEPLOY_TOKEN</span>. Doc :{" "}
              <span className="font-mono">docs/portal/linked-site-ci.md</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={tokenBusy}
              onClick={() => void handleIssueToken()}
            >
              {tokenBusy ? "Génération…" : "Générer un token"}
            </Button>
            {hasActiveDeployToken ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={tokenBusy}
                onClick={() => void handleRevokeToken()}
              >
                Révoquer
              </Button>
            ) : (
              <span className="text-muted-foreground text-xs">Aucun token actif.</span>
            )}
          </div>

          {issuedToken ? (
            <div className="border-border bg-background/80 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs">
                Copie ce token maintenant — il ne sera plus affiché.
              </p>
              <code className="mt-2 block overflow-x-auto font-mono text-xs break-all">
                {issuedToken}
              </code>
            </div>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive w-fit"
            disabled={clearBusy}
            onClick={() => void handleClearLinkedSite()}
          >
            Retirer le site lié
          </Button>
        </div>
      ) : null}
    </section>
  );
}
