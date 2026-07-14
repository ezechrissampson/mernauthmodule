import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

const storage = multer.memoryStorage(); // buffer piped straight to Cloudinary, never touches disk

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(ApiError.badRequest('Only JPEG, PNG, and WEBP images are allowed.'));
  }
  cb(null, true);
}

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
}).single('avatar');

/** Wraps multer's callback style so errors flow into the centralized error handler. */
export function handleAvatarUpload(req, res, next) {
  uploadAvatar(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.badRequest('Image must be smaller than 3MB.'));
      }
      return next(ApiError.badRequest(err.message));
    }
    if (err) return next(err);
    next();
  });
}
