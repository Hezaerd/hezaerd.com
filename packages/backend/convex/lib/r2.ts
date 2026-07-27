import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireR2Env(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Variable Convex manquante : ${name}`);
  }
  return value.trim();
}

export function createR2Client(): S3Client {
  const accountId = requireR2Env("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireR2Env("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireR2Env("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export function getR2BucketName(): string {
  return requireR2Env("R2_BUCKET_NAME");
}

export async function createUploadPresignedUrl(input: {
  key: string;
  contentType: string;
  maxSizeBytes: number;
  expiresInSeconds: number;
}): Promise<string> {
  const client = createR2Client();
  const command = new PutObjectCommand({
    Bucket: getR2BucketName(),
    Key: input.key,
    ContentType: input.contentType,
    ContentLength: input.maxSizeBytes,
  });
  return getSignedUrl(client, command, { expiresIn: input.expiresInSeconds });
}

export async function createDownloadPresignedUrl(input: {
  key: string;
  expiresInSeconds: number;
  fileName: string;
}): Promise<string> {
  const client = createR2Client();
  const command = new GetObjectCommand({
    Bucket: getR2BucketName(),
    Key: input.key,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(input.fileName)}"`,
  });
  return getSignedUrl(client, command, { expiresIn: input.expiresInSeconds });
}

export async function createPreviewPresignedUrl(input: {
  key: string;
  expiresInSeconds: number;
  contentType: string;
}): Promise<string> {
  const client = createR2Client();
  const command = new GetObjectCommand({
    Bucket: getR2BucketName(),
    Key: input.key,
    ResponseContentType: input.contentType,
  });
  return getSignedUrl(client, command, { expiresIn: input.expiresInSeconds });
}

export async function deleteR2Object(key: string): Promise<void> {
  const client = createR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
  );
}

export async function headR2Object(key: string): Promise<{
  contentLength: number;
  contentType?: string;
}> {
  const client = createR2Client();
  const response = await client.send(
    new HeadObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
  );
  return {
    contentLength: response.ContentLength ?? 0,
    contentType: response.ContentType,
  };
}
