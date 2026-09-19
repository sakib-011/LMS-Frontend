// ============================================================
// BookGrid — Professional Reusable Image Validation Utility
// ============================================================

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

// Configurable Max File Size Limit (Default: 5 MB)
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Allowed Extension & MIME Types
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Synchronous fast check for file metadata (existence, size, extension, MIME type)
 */
export const validateImageMetadata = (file: File | null | undefined): ValidationResult => {
  // A. Check file existence
  if (!file || file.size === 0) {
    return {
      valid: false,
      error: 'Please select an image file.',
    };
  }

  // B. Check file size limit (5 MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Invalid image size. Maximum allowed file size is ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  // C. Check file extension (case-insensitive)
  const fileName = file.name || '';
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return {
      valid: false,
      error: 'Invalid file. File must have a valid extension (.jpg, .jpeg, .png, .webp).',
    };
  }

  const extension = fileName.substring(lastDotIndex).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Invalid image format. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}.`,
    };
  }

  // D. Check MIME type
  const mimeType = (file.type || '').toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid image type (${mimeType}). Allowed MIME types: image/jpeg, image/png, image/webp.`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Asynchronous check to decode actual image data using Browser APIs (Image / FileReader / createImageBitmap).
 * Rejects malicious files (e.g. executable/script files renamed with .jpg extension).
 */
export const validateActualImageContent = (file: File): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    // 1. Try createImageBitmap if available (Modern Browser API)
    if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
      createImageBitmap(file)
        .then((bitmap) => {
          if (bitmap.width > 0 && bitmap.height > 0) {
            bitmap.close();
            resolve({ valid: true, error: null });
          } else {
            bitmap.close();
            resolve({ valid: false, error: 'File content could not be decoded as a valid image.' });
          }
        })
        .catch(() => {
          resolve({ valid: false, error: 'File content is corrupt or not a valid image format.' });
        });
      return;
    }

    // 2. Fallback: FileReader + HTMLImageElement
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width > 0 && img.height > 0) {
          resolve({ valid: true, error: null });
        } else {
          resolve({ valid: false, error: 'File content could not be decoded as a valid image.' });
        }
      };
      img.onerror = () => {
        resolve({ valid: false, error: 'File content is corrupt or not a valid image format.' });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve({ valid: false, error: 'Failed to read image file.' });
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Full Image Validation pipeline (Metadata + Actual Image Decoding)
 */
export const validateImage = async (file: File | null | undefined): Promise<ValidationResult> => {
  // Step 1: Metadata validation
  const metadataResult = validateImageMetadata(file);
  if (!metadataResult.valid) {
    return metadataResult;
  }

  // Step 2: Content decoding validation
  return await validateActualImageContent(file!);
};
