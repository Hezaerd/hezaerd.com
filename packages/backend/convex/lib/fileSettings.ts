import type { Doc } from "../_generated/dataModel";

export const DEFAULT_MAX_FILE_SIZE_MB = 100;
export const DEFAULT_UPLOAD_PRESIGN_TTL_HOURS = 24;
export const DEFAULT_DOWNLOAD_PRESIGN_TTL_MINUTES = 15;
export const MAX_UPLOAD_PRESIGN_TTL_HOURS = 48;
export const MAX_DOWNLOAD_PRESIGN_TTL_MINUTES = 60;

export type ClientFileSettings = {
  defaultMaxFileSizeMb: number;
  uploadPresignTtlHours: number;
  downloadPresignTtlMinutes: number;
};

export function resolveClientFileSettings(
  client: Pick<Doc<"clients">, "fileSettings">,
): ClientFileSettings {
  return {
    defaultMaxFileSizeMb: client.fileSettings?.defaultMaxFileSizeMb ?? DEFAULT_MAX_FILE_SIZE_MB,
    uploadPresignTtlHours:
      client.fileSettings?.uploadPresignTtlHours ?? DEFAULT_UPLOAD_PRESIGN_TTL_HOURS,
    downloadPresignTtlMinutes:
      client.fileSettings?.downloadPresignTtlMinutes ?? DEFAULT_DOWNLOAD_PRESIGN_TTL_MINUTES,
  };
}

export function validateClientFileSettings(input: Partial<ClientFileSettings>): ClientFileSettings {
  const defaultMaxFileSizeMb = input.defaultMaxFileSizeMb ?? DEFAULT_MAX_FILE_SIZE_MB;
  const uploadPresignTtlHours = input.uploadPresignTtlHours ?? DEFAULT_UPLOAD_PRESIGN_TTL_HOURS;
  const downloadPresignTtlMinutes =
    input.downloadPresignTtlMinutes ?? DEFAULT_DOWNLOAD_PRESIGN_TTL_MINUTES;

  if (!Number.isFinite(defaultMaxFileSizeMb) || defaultMaxFileSizeMb <= 0) {
    throw new Error("Taille max invalide");
  }
  if (
    !Number.isFinite(uploadPresignTtlHours) ||
    uploadPresignTtlHours <= 0 ||
    uploadPresignTtlHours > MAX_UPLOAD_PRESIGN_TTL_HOURS
  ) {
    throw new Error(`Durée upload max ${MAX_UPLOAD_PRESIGN_TTL_HOURS} h`);
  }
  if (
    !Number.isFinite(downloadPresignTtlMinutes) ||
    downloadPresignTtlMinutes <= 0 ||
    downloadPresignTtlMinutes > MAX_DOWNLOAD_PRESIGN_TTL_MINUTES
  ) {
    throw new Error(`Durée download max ${MAX_DOWNLOAD_PRESIGN_TTL_MINUTES} min`);
  }

  return {
    defaultMaxFileSizeMb,
    uploadPresignTtlHours,
    downloadPresignTtlMinutes,
  };
}
