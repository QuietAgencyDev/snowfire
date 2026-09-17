import type { PhotoType } from "@/types/database";

const PHOTO_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const PROPERTY_MEDIA_BUCKET = "job-media";

// Photos ride to the server inside a Server Action, and Vercel caps a function
// request body at 4.5 MB on every plan — a limit no framework setting lifts.
// Anything above it dies as a 413 the crew cannot act on, and since a visit
// cannot be completed without its before/after shots, that strands the job.
// The gap to 4.5 MB is left for multipart framing and the caption field.
export const MAX_PROPERTY_PHOTO_BYTES = 4 * 1024 * 1024;

// Message copy reads from the limit so the two cannot drift apart again.
export const MAX_PROPERTY_PHOTO_LABEL = `${MAX_PROPERTY_PHOTO_BYTES / (1024 * 1024)} MB`;

export function extensionForImageType(mimeType: string): string | null {
  return PHOTO_EXTENSIONS[mimeType] ?? null;
}

export function propertyPhotoPath(
  propertyId: string,
  photoType: PhotoType,
  fileId: string,
  extension: string,
): string {
  return `properties/${propertyId}/${photoType}/${fileId}.${extension}`;
}

export function jobPhotoPath(
  jobId: string,
  photoType: Extract<PhotoType, "BEFORE" | "AFTER">,
  fileId: string,
  extension: string,
): string {
  return `jobs/${jobId}/${photoType}/${fileId}.${extension}`;
}

export function isAllowedImageFile(file: File): boolean {
  return Boolean(extensionForImageType(file.type)) && file.size <= MAX_PROPERTY_PHOTO_BYTES;
}
