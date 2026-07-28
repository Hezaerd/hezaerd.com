import { api } from "@hezaerd/backend/api";
import type { Id } from "@hezaerd/backend/dataModel";
import { Badge } from "@hezaerd/ui/components/badge";
import { Button } from "@hezaerd/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@hezaerd/ui/components/dialog";
import { Input } from "@hezaerd/ui/components/input";
import { Separator } from "@hezaerd/ui/components/separator";
import { Copy01Icon, Globe02Icon, Key01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

import {
  cmsDeployTokensQuery,
  cmsDeskOverviewQuery,
  cmsDeskQuery,
} from "@/lib/convex-queries";

type DeskFieldRow = {
  schema: {
    _id: Id<"cmsFieldSchemas">;
    fieldKey: string;
    type: "text" | "image";
    label?: string;
    defaultValue?: string;
    deprecated?: boolean;
    constraints:
      | { maxLength: number; multiline?: boolean }
      | { aspect: string; maxWidth: number; priority?: boolean };
  };
  draftValue: string | null;
  publishedValue: string | null;
};

type CmsDeskContentProps = {
  clientId: string;
};

export function CmsDeskContent({ clientId }: CmsDeskContentProps) {
  const { data: rows } = useSuspenseQuery(cmsDeskQuery(clientId));
  const { data: overview } = useSuspenseQuery(cmsDeskOverviewQuery(clientId));
  const { data: tokens } = useSuspenseQuery(cmsDeployTokensQuery(clientId));

  const createDeployToken = useMutation(api.cms.createDeployToken);
  const revokeDeployToken = useMutation(api.cms.revokeDeployToken);
  const updateFieldLabel = useMutation(api.cms.updateFieldLabel);
  const updateFieldDefault = useMutation(api.cms.updateFieldDefault);
  const updateSiteUrl = useMutation(api.cms.updateSiteUrl);

  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [siteUrlDraft, setSiteUrlDraft] = useState(overview.cmsSiteUrl ?? "");
  const [siteUrlError, setSiteUrlError] = useState<string | null>(null);
  const [siteUrlSaving, setSiteUrlSaving] = useState(false);

  useEffect(() => {
    setSiteUrlDraft(overview.cmsSiteUrl ?? "");
  }, [overview.cmsSiteUrl]);

  async function handleGenerateToken() {
    setTokenError(null);
    try {
      const result = await createDeployToken({ slug: clientId });
      setGeneratedToken(result.token);
      setTokenDialogOpen(true);
    } catch (error) {
      setTokenError(error instanceof Error ? error.message : "Impossible de générer le token.");
    }
  }

  async function handleRevokeToken(tokenId: Id<"cmsDeployTokens">) {
    await revokeDeployToken({ slug: clientId, tokenId });
  }

  async function handleSaveSiteUrl() {
    setSiteUrlError(null);
    setSiteUrlSaving(true);
    try {
      await updateSiteUrl({ slug: clientId, siteUrl: siteUrlDraft.trim() });
    } catch (error) {
      setSiteUrlError(error instanceof Error ? error.message : "Enregistrement impossible.");
    } finally {
      setSiteUrlSaving(false);
    }
  }

  const activeRows = (rows as DeskFieldRow[]).filter((row) => !row.schema.deprecated);
  const deprecatedRows = (rows as DeskFieldRow[]).filter((row) => row.schema.deprecated);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Globe02Icon} size={16} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">CMS</h1>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Tokens deploy, labels des champs et URL de prévisualisation.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground text-sm font-medium">Deploy token</h2>
        <div className="border-border bg-muted/20 flex flex-col gap-3 rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              Token CI pour <code className="text-foreground">registerSchema</code> — affiché une
              seule fois à la création.
            </p>
            <Button type="button" size="sm" onClick={() => void handleGenerateToken()}>
              <HugeiconsIcon icon={Key01Icon} size={14} />
              Générer un token
            </Button>
          </div>
          {tokenError ? <p className="text-destructive text-sm">{tokenError}</p> : null}
          {tokens.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun token pour l&apos;instant.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {tokens.map((token) => (
                <li
                  key={token.id}
                  className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-medium">
                      {token.label ?? "Token deploy"}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Créé le {new Date(token.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={token.revokedAt ? "secondary" : "default"}>
                      {token.revokedAt ? "Révoqué" : "Actif"}
                    </Badge>
                    {!token.revokedAt ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void handleRevokeToken(token.id)}
                      >
                        Révoquer
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground text-sm font-medium">URL du site (preview)</h2>
        <div className="border-border bg-muted/20 flex flex-col gap-3 rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">
            Base HTTPS utilisée pour le lien « Prévisualiser » côté client.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={siteUrlDraft}
              onChange={(event) => setSiteUrlDraft(event.target.value)}
              placeholder="https://mon-client.pages.dev"
            />
            <Button
              type="button"
              size="sm"
              disabled={siteUrlSaving}
              onClick={() => void handleSaveSiteUrl()}
            >
              {siteUrlSaving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
          {siteUrlError ? <p className="text-destructive text-sm">{siteUrlError}</p> : null}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground text-sm font-medium">État publish</h2>
        <div className="border-border bg-muted/20 rounded-xl border px-4 py-3">
          {overview.publishVersion ? (
            <p className="text-sm">
              Version <span className="font-medium">{overview.publishVersion}</span>
              {overview.publishedAt ? (
                <span className="text-muted-foreground">
                  {" "}
                  · publié le {new Date(overview.publishedAt).toLocaleString("fr-FR")}
                </span>
              ) : null}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">Aucune publication pour l&apos;instant.</p>
          )}
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground text-sm font-medium">Schéma des champs</h2>
        {activeRows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucun champ — déploie le site client pour enregistrer le schéma.
          </p>
        ) : (
          <div className="border-border overflow-hidden rounded-xl border">
            <div className="bg-muted/40 text-muted-foreground grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 px-3 py-2 text-xs font-medium">
              <span>Clé</span>
              <span>Type</span>
              <span>Label</span>
              <span>Default (texte)</span>
            </div>
            {activeRows.map((row) => (
              <DeskFieldRowEditor
                key={row.schema._id}
                row={row}
                onSaveLabel={(label) =>
                  updateFieldLabel({ slug: clientId, fieldKey: row.schema.fieldKey, label })
                }
                onSaveDefault={(defaultValue) =>
                  updateFieldDefault({
                    slug: clientId,
                    fieldKey: row.schema.fieldKey,
                    defaultValue,
                  })
                }
              />
            ))}
          </div>
        )}
        {deprecatedRows.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-xs font-medium uppercase">Dépréciés</p>
            {deprecatedRows.map((row) => (
              <div
                key={row.schema._id}
                className="border-border flex items-center justify-between gap-2 rounded-lg border px-3 py-2 opacity-60"
              >
                <span className="font-mono text-sm">{row.schema.fieldKey}</span>
                <Badge variant="secondary">Déprécié</Badge>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Token deploy</DialogTitle>
            <DialogDescription>
              Copie ce token maintenant — il ne sera plus affiché.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted font-mono break-all rounded-lg px-3 py-2 text-sm">
            {generatedToken}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (generatedToken) {
                  void navigator.clipboard.writeText(generatedToken);
                }
              }}
            >
              <HugeiconsIcon icon={Copy01Icon} size={14} />
              Copier
            </Button>
            <Button type="button" onClick={() => setTokenDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DeskFieldRowEditor({
  row,
  onSaveLabel,
  onSaveDefault,
}: {
  row: DeskFieldRow;
  onSaveLabel: (label: string) => Promise<unknown>;
  onSaveDefault: (defaultValue: string) => Promise<unknown>;
}) {
  const [label, setLabel] = useState(row.schema.label ?? row.schema.fieldKey);
  const [defaultValue, setDefaultValue] = useState(row.schema.defaultValue ?? "");

  return (
    <div className="border-border grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 border-t px-3 py-2">
      <span className="font-mono text-xs">{row.schema.fieldKey}</span>
      <span className="text-muted-foreground text-xs">{row.schema.type}</span>
      <Input
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        onBlur={() => {
          if (label.trim() && label !== (row.schema.label ?? row.schema.fieldKey)) {
            void onSaveLabel(label.trim());
          }
        }}
        className="h-8 text-sm"
      />
      {row.schema.type === "text" ? (
        <Input
          value={defaultValue}
          onChange={(event) => setDefaultValue(event.target.value)}
          onBlur={() => {
            if (defaultValue !== (row.schema.defaultValue ?? "")) {
              void onSaveDefault(defaultValue);
            }
          }}
          className="h-8 text-sm"
        />
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      )}
    </div>
  );
}
