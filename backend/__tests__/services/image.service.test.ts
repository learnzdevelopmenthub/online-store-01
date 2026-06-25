import { beforeEach, describe, expect, it, vi } from 'vitest';

const toBuffer = vi.fn(async () => Buffer.from('webp'));
const webp = vi.fn(() => ({ toBuffer }));
const resize = vi.fn(() => ({ webp }));
const sharp = vi.fn(() => ({ resize }));

vi.mock('sharp', () => ({
  default: sharp,
}));

describe('image.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resizes covers to 400x600 WebP', async () => {
    const { resizeCoverImage } = await import('../../src/services/image.service.js');

    const output = await resizeCoverImage(Buffer.from('cover'));

    expect(output.toString()).toBe('webp');
    expect(resize).toHaveBeenCalledWith(400, 600, { fit: 'cover', position: 'center' });
    expect(webp).toHaveBeenCalledWith({ quality: 82 });
  });
});
