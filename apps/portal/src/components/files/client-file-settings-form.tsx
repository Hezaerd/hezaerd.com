import { api } from "@hezaerd/backend/api";
import { Button } from "@hezaerd/ui/components/button";
import { Input } from "@hezaerd/ui/components/input";
import { useMutation } from "convex/react";
import { useState } from "react";

import {
  DEFAULT_DOWNLOAD_PRESIGN_TTL_MINUTES,
  DEFAULT_MAX_FILE_SIZE_MB,
  DEFAULT_UPLOAD_PRESIGN_TTL_HOURS,
  MAX_DOWNLOAD_PRESIGN_TTL_MINUTES,
  MAX_UPLOAD_PRESIGN_TTL_HOURS,
} from "@/lib/file-settings-constants";
import { resolvePortalFileSettings, type PortalClient } from "@/lib/portal-types";

type ClientFileSettingsFormProps = {
  client: PortalClient;
};

export function ClientFileSettingsForm({ client }: ClientFileSettingsFormProps) {
  const defaults = resolvePortalFileSettings(client);
  const updateFileSettings = useMutation(api.clients.updateFileSettings);

  const [defaultMaxFileSizeMb, setDefaultMaxFileSizeMb] = useState(String(defaults.defaultMaxFileSizeMb));
  const [uploadPresignTtlHours, setUploadPresignTtlHours] = useState(
    String(defaults.uploadPresignTtlHours),
  );
  const [downloadPresignTtlMinutes, setDownloadPresignTtlMinutes] = useState(
    String(defaults.downloadPresignTtlMinutes),
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSaved(false);
    const parsed = {
      defaultMaxFileSizeMb: Number(defaultMaxFileSizeMb),
      uploadPresignTtlHours: Number(uploadPresignTtlHours),
      downloadPresignTtlMinutes: Number(downloadPresignTtlMinutes),
    };

    setSubmitting(true);
    try {
      await updateFileSettings({
        slug: client.id,
        ...parsed,
      });
      setSaved(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Enregistrement impossible.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-5">
      <div>
        <h3 className="font-display text-base font-semibold tracking-tight">Fichiers</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Défauts pour les nouvelles demandes et durées des liens signés.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="default-max-size" className="text-sm font-medium">
            Taille max par défaut (Mo)
          </label>
          <Input
            id="default-max-size"
            inputMode="numeric"
            value={defaultMaxFileSizeMb}
            onChange={(event) => setDefaultMaxFileSizeMb(event.target.value)}
            placeholder={String(DEFAULT_MAX_FILE_SIZE_MB)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="upload-ttl" className="text-sm font-medium">
            Lien upload (h, max {MAX_UPLOAD_PRESIGN_TTL_HOURS})
          </label>
          <Input
            id="upload-ttl"
            inputMode="numeric"
            value={uploadPresignTtlHours}
            onChange={(event) => setUploadPresignTtlHours(event.target.value)}
            placeholder={String(DEFAULT_UPLOAD_PRESIGN_TTL_HOURS)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="download-ttl" className="text-sm font-medium">
            Lien download (min, max {MAX_DOWNLOAD_PRESIGN_TTL_MINUTES})
          </label>
          <Input
            id="download-ttl"
            inputMode="numeric"
            value={downloadPresignTtlMinutes}
            onChange={(event) => setDownloadPresignTtlMinutes(event.target.value)}
            placeholder={String(DEFAULT_DOWNLOAD_PRESIGN_TTL_MINUTES)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" disabled={submitting} onClick={() => void handleSubmit()}>
          {submitting ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {saved ? <p className="text-muted-foreground text-sm">Enregistré.</p> : null}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>
    </section>
  );
}
