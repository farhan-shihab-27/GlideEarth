/**
 * ============================================================================
 * GLIDEEARTH — FILE UPLOAD MIDDLEWARE & STORAGE ABSTRACTION
 * ============================================================================
 * Handles multipart/form-data file uploads via Multer with a clean
 * abstraction layer that can be swapped between storage backends:
 *
 *   • LOCAL DISK   (current — development / small-scale production)
 *   • AWS S3       (future — scalable cloud storage)
 *   • CLOUDINARY   (future — image CDN with on-the-fly transforms)
 *
 * ARCHITECTURE:
 * ─────────────
 * Multer is configured with MEMORY STORAGE (files land in req.files as
 * Buffers). This decouples the upload parsing from the storage destination.
 * The `saveFile()` / `deleteFile()` functions handle the actual persistence,
 * and only these need to change when migrating to S3 or Cloudinary.
 *
 * SECURITY:
 * ─────────
 * 1. MIME type whitelist — only JPEG, PNG, WebP accepted (no SVG/GIF).
 * 2. File size cap — 5MB per file (prevents DoS via large payloads).
 * 3. File count cap — max 10 images per upload batch.
 * 4. Filename sanitization — UUIDs replace original filenames to prevent
 *    path traversal and collision attacks.
 * ============================================================================
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ============================================================================
// CONSTANTS
// ============================================================================

/** Allowed MIME types — only raster image formats suitable for product photos */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

/** Human-readable list for error messages */
const ALLOWED_EXTENSIONS = '.jpg, .jpeg, .png, .webp';

/** Maximum file size: 5MB per image */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Maximum number of images per upload batch */
const MAX_FILES = 10;

/** Base directory for local file storage */
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

/** Subdirectory for product images */
const PRODUCTS_DIR = path.join(UPLOADS_DIR, 'products');

// ============================================================================
// ENSURE UPLOAD DIRECTORIES EXIST
// ============================================================================

if (!fs.existsSync(PRODUCTS_DIR)) {
  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
}

// ============================================================================
// MULTER CONFIGURATION — MEMORY STORAGE
// ============================================================================
// Files are stored as Buffers in memory (req.files[].buffer).
// This allows us to:
//   1. Validate the file before persisting it anywhere.
//   2. Easily swap the destination (disk, S3, Cloudinary) without
//      changing the Multer config.
//   3. Process/resize images in-memory before saving (future).

const storage = multer.memoryStorage();

/**
 * File filter — rejects files with disallowed MIME types immediately,
 * before any data is processed.
 */
function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_EXTENSIONS}`
      ),
      false
    );
  }
}

/**
 * Configured Multer instance for product image uploads.
 *
 * Usage in routes:
 *   const { uploadProductImages } = require('../../utils/upload');
 *   router.post('/', uploadProductImages, controller.create);
 *
 * After this middleware runs, `req.files` contains an array of file objects:
 *   [{ fieldname, originalname, mimetype, buffer, size }, ...]
 */
const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
}).array('images', MAX_FILES);

// ============================================================================
// STORAGE ABSTRACTION — Local Disk (Swap Point for S3/Cloudinary)
// ============================================================================

/**
 * Generate a collision-safe filename using crypto-random UUIDs.
 * Format: {uuid}.{extension}
 *
 * @param {string} originalname - Original filename from the upload.
 * @returns {string} Sanitized, unique filename.
 */
function generateFilename(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const uuid = crypto.randomUUID();
  return `${uuid}${ext}`;
}

/**
 * Save a file buffer to local disk.
 *
 * SWAP POINT: Replace this function's body with S3 putObject or
 * Cloudinary upload to migrate storage backends. The interface
 * (input: buffer + originalname, output: URL string) stays the same.
 *
 * @param {Buffer} buffer - The file data from Multer's memory storage.
 * @param {string} originalname - Original filename (used for extension extraction).
 * @param {string} [subdirectory='products'] - Subdirectory within /uploads.
 * @returns {Promise<string>} The relative URL path to the saved file.
 *
 * @example
 *   const url = await saveFile(file.buffer, file.originalname);
 *   // Returns: "/uploads/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg"
 */
async function saveFile(buffer, originalname, subdirectory = 'products') {
  const filename = generateFilename(originalname);
  const targetDir = path.join(UPLOADS_DIR, subdirectory);

  // Ensure subdirectory exists (idempotent)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, filename);
  await fs.promises.writeFile(filePath, buffer);

  // Return a URL-friendly path (forward slashes, relative to server root)
  return `/uploads/${subdirectory}/${filename}`;
}

/**
 * Delete a file from local disk.
 *
 * SWAP POINT: Replace with S3 deleteObject or Cloudinary destroy.
 *
 * @param {string} fileUrl - The relative URL path returned by saveFile().
 * @returns {Promise<void>}
 */
async function deleteFile(fileUrl) {
  if (!fileUrl) return;

  const filePath = path.resolve(__dirname, '../..', fileUrl.replace(/^\//, ''));

  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    // File may already be deleted — log but don't throw
    if (err.code !== 'ENOENT') {
      console.error(`[UPLOAD] Failed to delete file: ${filePath}`, err.message);
    }
  }
}

// ============================================================================
// MULTER ERROR HANDLER MIDDLEWARE
// ============================================================================
// Multer throws its own error types. This middleware transforms them
// into our standardized AppError format before they hit the global handler.

const AppError = require('./AppError');

/**
 * Express middleware to catch and transform Multer-specific errors
 * into AppError instances with clean client messages.
 *
 * Usage — place AFTER the multer middleware in the route chain:
 *   router.post('/', uploadProductImages, handleUploadErrors, controller.create);
 *
 * Or wrap in the route file as:
 *   router.post('/', (req, res, next) => {
 *     uploadProductImages(req, res, (err) => {
 *       if (err) return handleUploadErrors(err, req, res, next);
 *       next();
 *     });
 *   }, controller.create);
 */
function handleUploadErrors(err, _req, _res, next) {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return next(AppError.badRequest(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`));
      case 'LIMIT_FILE_COUNT':
        return next(AppError.badRequest(`Too many files. Maximum is ${MAX_FILES} images per upload.`));
      case 'LIMIT_UNEXPECTED_FILE':
        return next(AppError.badRequest(err.message || `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS}`));
      default:
        return next(AppError.badRequest(`Upload error: ${err.message}`));
    }
  }

  // Non-Multer error — pass through to global handler
  next(err);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  uploadProductImages,
  handleUploadErrors,
  saveFile,
  deleteFile,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES,
};
