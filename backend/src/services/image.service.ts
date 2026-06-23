import sharp from 'sharp';

export async function resizeCoverImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(400, 600, { fit: 'cover', position: 'center' })
    .webp({ quality: 82 })
    .toBuffer();
}
