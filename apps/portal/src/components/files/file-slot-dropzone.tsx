import { Badge } from "@hezaerd/ui/components/badge";
import { Button } from "@hezaerd/ui/components/button";
import { cn } from "@hezaerd/ui/lib/utils";
import {
  CloudUploadIcon,
  Download01Icon,
  File01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";

import { formatExtensionsLabel } from "@/components/files/extension-tags-input";
import { FilePreviewDialog } from "@/components/files/file-preview-dialog";
import { useFileSlotUpload } from "@/components/files/use-file-slot-upload";
import type { FileRequestSlot } from "@/lib/portal-types";

type FileSlotDropzoneProps = {
  slot: FileRequestSlot;
  maxFileSizeMb: number;
};

export function FileSlotDropzone({ slot, maxFileSizeMb }: FileSlotDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<{
    url: string;
    fileName: string;
    previewKind: "image" | "pdf" | "video";
  } | null>(null);

  const { uploading, error, uploadFile, download, preview: loadPreview, received } =
    useFileSlotUpload(slot, maxFileSizeMb);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) {
      await uploadFile(file);
    }
  }

  async function handlePreview() {
    const result = await loadPreview();
    if (result) {
      setPreview(result);
      setPreviewOpen(true);
    }
  }

  return (
    <>
      <div
        className={cn(
          "relative rounded-xl border px-5 py-4 transition-colors",
          received
            ? "border-border bg-muted/20"
            : "border-border bg-muted/20 border-dashed",
          dragging && !received && "border-primary/40 bg-primary/5",
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.currentTarget.contains(event.relatedTarget as Node)) {
            return;
          }
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              received ? "bg-primary/10" : "bg-muted",
            )}
          >
            <HugeiconsIcon
              icon={File01Icon}
              size={16}
              className={received ? "text-primary" : "text-muted-foreground"}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-sm font-semibold tracking-tight">{slot.label}</p>
              <Badge variant={received ? "default" : "secondary"}>
                {received ? "Reçu" : "En attente"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {formatExtensionsLabel(slot.allowedExtensions)} · max {maxFileSizeMb} Mo
            </p>

            {slot.file ? (
              <p className="text-muted-foreground mt-2 truncate text-sm">{slot.file.fileName}</p>
            ) : (
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {dragging
                  ? "Relâche pour envoyer"
                  : "Glisse un fichier ici ou utilise le bouton ci-dessous."}
              </p>
            )}

            {error ? <p className="text-destructive mt-2 text-sm">{error}</p> : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(event) => void handleFiles(event.target.files)}
              />
              <Button
                type="button"
                variant={received ? "outline" : "default"}
                size="sm"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                <HugeiconsIcon icon={CloudUploadIcon} size={14} />
                {uploading ? "Envoi…" : received ? "Remplacer" : "Choisir un fichier"}
              </Button>
              {received ? (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={() => void handlePreview()}>
                    <HugeiconsIcon icon={ViewIcon} size={14} />
                    Voir
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void download()}>
                    <HugeiconsIcon icon={Download01Icon} size={14} />
                    Télécharger
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {preview ? (
        <FilePreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          previewKind={preview.previewKind}
          url={preview.url}
          fileName={preview.fileName}
        />
      ) : null}
    </>
  );
}
