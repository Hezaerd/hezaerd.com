import { api } from "@hezaerd/backend/api";
import { Button } from "@hezaerd/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@hezaerd/ui/components/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hezaerd/ui/components/empty";
import { Input } from "@hezaerd/ui/components/input";
import { Textarea } from "@hezaerd/ui/components/textarea";
import { CloudUploadIcon, Globe02Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAction, useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";

import { useCmsImageUpload } from "@/components/cms/use-cms-image-upload";
import { cmsWorkspaceQuery } from "@/lib/convex-queries";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";

type WorkspaceField = {
  schema: {
    fieldKey: string;
    type: "text" | "image";
    label?: string;
    defaultValue?: string;
    constraints:
      | { maxLength: number; multiline?: boolean }
      | { aspect: string; maxWidth: number; priority?: boolean };
  };
  draftValue: string | null;
};

type CmsWorkspaceContentProps = {
  clientId: string;
};

export function CmsWorkspaceContent({ clientId }: CmsWorkspaceContentProps) {
  const { data } = useSuspenseQuery(cmsWorkspaceQuery(clientId));
  const createPreviewLink = useMutation(api.cms.createPreviewLink);
  const publish = useAction(api.cmsPublish.publish);

  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  const fields = data.fields as WorkspaceField[];
  const hasUnpublishedChanges = data.hasUnpublishedChanges;

  async function handlePreview() {
    setActionError(null);
    setPreviewLoading(true);
    try {
      const result = await createPreviewLink({ slug: clientId });
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Prévisualisation impossible.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handlePublish() {
    setActionError(null);
    setPublishSuccess(null);
    setPublishing(true);
    try {
      const result = await publish({ slug: clientId });
      setPublishSuccess(`Version ${result.version} publiée.`);
      setPublishOpen(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Publication impossible.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Globe02Icon} size={16} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Mon site</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Champs guidés — prévisualisez vos changements avant de publier.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={previewLoading}
          onClick={() => void handlePreview()}
        >
          <HugeiconsIcon icon={ViewIcon} size={14} />
          {previewLoading ? "Génération…" : "Prévisualiser"}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!hasUnpublishedChanges}
          onClick={() => setPublishOpen(true)}
        >
          Publier
        </Button>
      </div>

      {actionError ? <p className="text-destructive text-sm">{actionError}</p> : null}
      {publishSuccess ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{publishSuccess}</p> : null}

      {fields.length === 0 ? (
        <Empty className="border-border bg-muted/20 rounded-xl border py-16">
          <EmptyHeader>
            <EmptyTitle className="font-display text-base font-semibold tracking-tight">
              Aucun champ configuré
            </EmptyTitle>
            <EmptyDescription className="text-muted-foreground text-sm">
              Déployez le site client pour enregistrer le schéma.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-6">
          {fields.map((field) =>
            field.schema.type === "text" ? (
              <CmsTextFieldEditor
                key={field.schema.fieldKey}
                clientId={clientId}
                field={field}
              />
            ) : (
              <CmsImageFieldEditor
                key={field.schema.fieldKey}
                clientId={clientId}
                field={field}
              />
            ),
          )}
        </div>
      )}

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publier les changements ?</DialogTitle>
            <DialogDescription>
              Le contenu publié remplacera la version en ligne sur le site.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPublishOpen(false)}>
              Annuler
            </Button>
            <Button type="button" disabled={publishing} onClick={() => void handlePublish()}>
              {publishing ? "Publication…" : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CmsTextFieldEditor({
  clientId,
  field,
}: {
  clientId: string;
  field: WorkspaceField;
}) {
  const upsertDraftText = useMutation(api.cms.upsertDraftText);
  const constraints = field.schema.constraints as { maxLength: number; multiline?: boolean };
  const initialValue = field.draftValue ?? field.schema.defaultValue ?? "";
  const [value, setValue] = useState(initialValue);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(field.draftValue ?? field.schema.defaultValue ?? "");
  }, [field.draftValue, field.schema.defaultValue]);

  const debouncedSave = useDebouncedCallback(async (nextValue: string) => {
    setSaveError(null);
    setSaving(true);
    try {
      await upsertDraftText({
        slug: clientId,
        fieldKey: field.schema.fieldKey,
        value: nextValue,
      });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }, 500);

  const label = field.schema.label ?? field.schema.fieldKey;
  const charCount = value.length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="font-display text-sm font-semibold tracking-tight">{label}</label>
        <span className="text-muted-foreground text-xs">
          {charCount}/{constraints.maxLength}
          {saving ? " · enregistrement…" : null}
        </span>
      </div>
      {constraints.multiline ? (
        <Textarea
          value={value}
          rows={4}
          onChange={(event) => {
            const nextValue = event.target.value;
            setValue(nextValue);
            debouncedSave(nextValue);
          }}
        />
      ) : (
        <Input
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            setValue(nextValue);
            debouncedSave(nextValue);
          }}
        />
      )}
      {saveError ? <p className="text-destructive text-sm">{saveError}</p> : null}
    </div>
  );
}

function CmsImageFieldEditor({
  clientId,
  field,
}: {
  clientId: string;
  field: WorkspaceField;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, error, uploadImage } = useCmsImageUpload(clientId, field.schema.fieldKey);
  const imageUrl = field.draftValue;
  const label = field.schema.label ?? field.schema.fieldKey;
  const constraints = field.schema.constraints as {
    aspect: string;
    maxWidth: number;
  };

  async function handleFileChange(files: FileList | null) {
    const file = files?.[0];
    if (file) {
      await uploadImage(file);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-display text-sm font-semibold tracking-tight">{label}</label>
      <p className="text-muted-foreground text-xs">
        Ratio {constraints.aspect} · max {constraints.maxWidth}px
      </p>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={label}
          className="border-border max-h-48 w-auto max-w-full rounded-lg border object-contain"
        />
      ) : (
        <div className="border-border bg-muted/20 flex h-32 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground text-sm">Aucune image</p>
        </div>
      )}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label={`Choisir une image pour ${label}`}
          onChange={(event) => void handleFileChange(event.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <HugeiconsIcon icon={CloudUploadIcon} size={14} />
          {uploading ? "Envoi…" : imageUrl ? "Remplacer" : "Choisir une image"}
        </Button>
      </div>
    </div>
  );
}
