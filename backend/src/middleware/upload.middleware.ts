import multer from 'multer';

import { AppError } from '../utils/AppError.js';

const PDF_MIME_TYPES = new Set(['application/pdf']);
const IMAGE_MIME_PREFIX = 'image/';

export const bookUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 3,
  },
  fileFilter: (_req, file, cb) => {
    const isPdf = PDF_MIME_TYPES.has(file.mimetype);
    const isImage = file.mimetype.startsWith(IMAGE_MIME_PREFIX);
    const valid =
      (file.fieldname === 'coverImage' && isImage) ||
      (file.fieldname === 'pdf' && isPdf) ||
      (file.fieldname === 'samplePdf' && isPdf);

    if (!valid) {
      cb(new AppError(400, 'Invalid upload file type'));
      return;
    }
    cb(null, true);
  },
});
