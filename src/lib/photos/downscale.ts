import { MAX_PROPERTY_PHOTO_BYTES } from "./paths";

// Shrinks a camera photo in the browser so it fits what the server can accept.
//
// Uploads travel inside a Server Action, and Vercel refuses any function request
// body over 4.5 MB. A modern phone clears that on a single shot, so without this
// the crew photographs a driveway and the save fails — which, because a visit is
// gated on its before/after pair, leaves the job stuck.
//
// Every failure path here returns the original file rather than throwing. The
// server still validates size, so the worst case is the plain "photo too large"
// message instead of a broken form.

// A driveway record shot has to be legible, not archival. 2048px on the long
// edge is more than any screen it will be viewed on, and it is what brings a
// 12MP photo inside budget without argument.
const LONG_EDGE = 2048;

// Below this the photo stops being usable evidence, so give up and let the
// server explain itself instead of uploading mush.
const FLOOR_EDGE = 800;

const QUALITIES = [0.82, 0.7, 0.6, 0.5];

// Aim under the cap, not at it: multipart framing and the caption ride along.
const TARGET_BYTES = Math.round(MAX_PROPERTY_PHOTO_BYTES * 0.9);

function jpegName(name: string): string {
  return `${name.replace(/\.[^.]+$/, "")}.jpg`;
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });
}

export async function shrinkImageForUpload(file: File): Promise<File> {
  const alreadySmallEnough = file.size <= TARGET_BYTES;
  const canDecode =
    typeof createImageBitmap === "function" && typeof document !== "undefined";

  if (alreadySmallEnough || !canDecode) {
    return file;
  }

  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    // Step the long edge down, and at each size try progressively harder
    // compression before giving up more pixels. Dropping quality first keeps
    // detail that a smaller canvas would throw away for good.
    for (let edge = LONG_EDGE; edge >= FLOOR_EDGE; edge = Math.round(edge / 1.5)) {
      const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        return file;
      }

      context.drawImage(bitmap, 0, 0, width, height);

      for (const quality of QUALITIES) {
        const blob = await encode(canvas, quality);

        if (blob && blob.size <= TARGET_BYTES) {
          return new File([blob], jpegName(file.name), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
        }
      }
    }

    return file;
  } finally {
    bitmap.close();
  }
}
