import { api } from "@hezaerd/backend/api";
import type { Id } from "@hezaerd/backend/dataModel";
import { Badge } from "@hezaerd/ui/components/badge";
import { Button } from "@hezaerd/ui/components/button";
import { Download01Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAction } from "convex/react";
import { useState } from "react";

import { formatExtensionsLabel } from "@/components/files/extension-tags-input";
import { FilePreviewDialog } from "@/components/files/file-preview-dialog";
import type { FileRequestSlot } from "@/lib/portal-types";

export function OperatorFileSlotRow({ slot }: { slot: FileRequestSlot }) {
  const getDownloadUrl = useAction(api.fileStorage.getDownloadUrl);
  const getPreviewUrl = useAction(api.fileStorage.getPreviewUrl);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<{
    url: string;
    fileName: string;
    previewKind: "image" | "pdf" | "video" | "none";
  } | null>(null);

  async function handleDownload() {
    const result = await getDownloadUrl({ slotId: slot._id as Id<"fileRequestSlots"> });
    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  async function handlePreview() {
    const result = await getPreviewUrl({ slotId: slot._id as Id<"fileRequestSlots"> });
    if (result.previewKind === "none") {
      await handleDownload();
      return;
    }
    setPreview({
      url: result.url,
      fileName: result.fileName,
      previewKind: result.previewKind,
    });
    setPreviewOpen(true);
  }

  return (
    <>
      <div className="border-border bg-background/60 flex items-start justify-between gap-4 rounded-lg border px-4 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{slot.label}</p>
            <Badge variant={slot.file ? "default" : "secondary"}>
              {slot.file ? "Reçu" : "En attente"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {formatExtensionsLabel(slot.allowedExtensions)}
          </p>
          {slot.file ? (
            <p className="text-muted-foreground mt-1 text-sm">
              {slot.file.fileName}
              {slot.file.replacedAt ? " · remplacé" : ""}
            </p>
          ) : null}
        </div>
        {slot.file ? (
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void handlePreview()}>
              <HugeiconsIcon icon={ViewIcon} size={14} />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => void handleDownload()}>
              <HugeiconsIcon icon={Download01Icon} size={14} />
            </Button>
          </div>
        ) : null}
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
