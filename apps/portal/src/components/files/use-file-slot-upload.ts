import { api } from "@hezaerd/backend/api";
import type { Id } from "@hezaerd/backend/dataModel";
import { useAction } from "convex/react";
import { useCallback, useState } from "react";

import { formatExtensionsLabel } from "@/components/files/extension-tags-input";
import type { FileRequestSlot } from "@/lib/portal-types";

function extensionAllowed(fileName: string, allowedExtensions: string[]): boolean {
  if (allowedExtensions.length === 0) {
    return true;
  }
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return extension.length > 0 && allowedExtensions.includes(extension);
}

export function useFileSlotUpload(slot: FileRequestSlot, maxFileSizeMb: number) {
  const prepareUpload = useAction(api.fileStorage.prepareUpload);
  const completeUpload = useAction(api.fileStorage.completeUpload);
  const getDownloadUrl = useAction(api.fileStorage.getDownloadUrl);
  const getPreviewUrl = useAction(api.fileStorage.getPreviewUrl);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!extensionAllowed(file.name, slot.allowedExtensions)) {
        setError(`Ce slot attend ${formatExtensionsLabel(slot.allowedExtensions)}.`);
        return false;
      }
      if (file.size > maxFileSizeMb * 1024 * 1024) {
        setError(`Fichier trop lourd (max ${maxFileSizeMb} Mo).`);
        return false;
      }

      setUploading(true);
      try {
        const { uploadUrl } = await prepareUpload({
          slotId: slot._id as Id<"fileRequestSlots">,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        });

        const response = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });

        if (!response.ok) {
          throw new Error("Upload échoué");
        }

        await completeUpload({
          slotId: slot._id as Id<"fileRequestSlots">,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        });
        return true;
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Upload impossible.");
        return false;
      } finally {
        setUploading(false);
      }
    },
    [
      completeUpload,
      maxFileSizeMb,
      prepareUpload,
      slot._id,
      slot.allowedExtensions,
    ],
  );

  const download = useCallback(async () => {
    const result = await getDownloadUrl({ slotId: slot._id as Id<"fileRequestSlots"> });
    window.open(result.url, "_blank", "noopener,noreferrer");
  }, [getDownloadUrl, slot._id]);

  const preview = useCallback(async () => {
    const result = await getPreviewUrl({ slotId: slot._id as Id<"fileRequestSlots"> });
    if (result.previewKind === "none") {
      const downloadResult = await getDownloadUrl({ slotId: slot._id as Id<"fileRequestSlots"> });
      window.open(downloadResult.url, "_blank", "noopener,noreferrer");
      return null;
    }
    return {
      url: result.url,
      fileName: result.fileName,
      previewKind: result.previewKind,
    };
  }, [getDownloadUrl, getPreviewUrl, slot._id]);

  return {
    uploading,
    error,
    uploadFile,
    download,
    preview,
    received: Boolean(slot.file),
  };
}
