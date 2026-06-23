import { beforeEach, describe, expect, it, vi } from 'vitest';

const send = vi.fn(async () => ({}));
const getSignedUrl = vi.fn(async () => 'https://signed.example.com/file.pdf');

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(function S3Client() {
    return { send };
  }),
  PutObjectCommand: vi.fn(function PutObjectCommand(input) {
    return { type: 'put', input };
  }),
  DeleteObjectCommand: vi.fn(function DeleteObjectCommand(input) {
    return { type: 'delete', input };
  }),
  GetObjectCommand: vi.fn(function GetObjectCommand(input) {
    return { type: 'get', input };
  }),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl,
}));

describe('r2.service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.R2_ACCOUNT_ID = 'account';
    process.env.R2_ACCESS_KEY_ID = 'access';
    process.env.R2_SECRET_ACCESS_KEY = 'secret';
    process.env.R2_PUBLIC_BUCKET = 'books-public';
    process.env.R2_PRIVATE_BUCKET = 'books-private';
    process.env.R2_PUBLIC_URL = 'https://cdn.example.com';
  });

  it('uploads, deletes and creates presigned URLs through the S3 client', async () => {
    const service = await import('../../src/services/r2.service.js');

    await service.uploadFile('covers/book.webp', Buffer.from('image'), 'image/webp', 'public');
    await service.deleteFile('covers/book.webp', 'public');
    const url = await service.getPresignedGetUrl('pdfs/book.pdf', 900);

    expect(send).toHaveBeenCalledTimes(2);
    expect(getSignedUrl).toHaveBeenCalledTimes(1);
    expect(url).toBe('https://signed.example.com/file.pdf');
    expect(service.getPublicUrl('covers/book.webp')).toBe(
      'https://cdn.example.com/covers/book.webp',
    );
  });
});
