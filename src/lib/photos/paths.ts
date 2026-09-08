import type { PhotoType } from "@/types/database";

const PHOTO_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const PROPERTY_MEDIA_BUCKET = "job-media";
export const MAX_PROPERTY_PHOTO_BYTES = 6 * 1024 * 1024;

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
