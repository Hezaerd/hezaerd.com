import { api } from "@hezaerd/backend/api";
import { useAction } from "convex/react";
import { useCallback, useState } from "react";

const CMS_IMAGE_MAX_MB = 10;

export function useCmsImageUpload(slug: string, fieldKey: string) {
  const prepareImageUpload = useAction(api.cmsStorage.prepareImageUpload);
  const completeImageUpload = useAction(api.cmsStorage.completeImageUpload);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith("image/")) {
        setError("Choisis une image (JPEG, PNG ou WebP).");
        return null;
      }
      if (file.size > CMS_IMAGE_MAX_MB * 1024 * 1024) {
        setError(`Image trop lourde (max ${CMS_IMAGE_MAX_MB} Mo).`);
        return null;
      }

      setUploading(true);
      try {
        const contentType = file.type || "application/octet-stream";
        const { uploadUrl, assetId } = await prepareImageUpload({
          slug,
          fieldKey,
          contentType,
          sizeBytes: file.size,
        });

        const response = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": contentType },
          body: file,
        });
        if (!response.ok) {
          throw new Error("Upload échoué");
        }

        const result = await completeImageUpload({
          slug,
          fieldKey,
          contentType,
          sizeBytes: file.size,
          assetId,
        });
        return result.publicUrl;
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Upload impossible.");
        return null;
      } finally {
        setUploading(false);
      }
    },
    [completeImageUpload, fieldKey, prepareImageUpload, slug],
  );

  return { uploading, error, uploadImage };
}
