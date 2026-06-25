import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export type R2BucketKind = 'public' | 'private';

let client: S3Client | null = null;

function requireR2Config() {
  const missing = [
    ['R2_ACCOUNT_ID', env.R2_ACCOUNT_ID],
    ['R2_ACCESS_KEY_ID', env.R2_ACCESS_KEY_ID],
    ['R2_SECRET_ACCESS_KEY', env.R2_SECRET_ACCESS_KEY],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new AppError(500, `R2 configuration missing: ${missing.join(', ')}`);
  }

  return {
    accountId: env.R2_ACCOUNT_ID as string,
    accessKeyId: env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY as string,
  };
}

export function getR2Client(): S3Client {
  if (!client) {
    const config = requireR2Config();
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return client;
}

function bucketName(kind: R2BucketKind): string {
  return kind === 'public' ? env.R2_PUBLIC_BUCKET : env.R2_PRIVATE_BUCKET;
}

export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string,
  bucket: R2BucketKind = 'private',
): Promise<string> {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucketName(bucket),
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  return key;
}

export async function deleteFile(key: string, bucket: R2BucketKind = 'private'): Promise<void> {
  await getR2Client().send(new DeleteObjectCommand({ Bucket: bucketName(bucket), Key: key }));
}

export async function getPresignedGetUrl(
  key: string,
  expiresInSeconds: number,
  bucket: R2BucketKind = 'private',
): Promise<string> {
  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand({ Bucket: bucketName(bucket), Key: key }),
    { expiresIn: expiresInSeconds },
  );
}

export function getPublicUrl(key: string): string {
  if (!env.R2_PUBLIC_URL) {
    return key;
  }
  return `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
}
