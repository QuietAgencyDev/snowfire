"use client";

import { useCallback, useState, type ChangeEvent } from "react";
import { shrinkImageForUpload } from "@/lib/photos/downscale";

// Wraps a plain file input so the chosen photo is shrunk before the form is
// submitted. Written as a hook rather than a component so the existing inputs
// and their styling stay exactly as they are.
//
// Callers must honour `preparing`: swapping the file is asynchronous, and a
// submit that lands first would send the untouched original.
export function usePhotoShrink() {
  const [preparing, setPreparing] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const onChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const chosen = input.files?.[0];

    if (!chosen) {
      setNote(null);
      return;
    }

    setPreparing(true);
    setNote("Preparing photo…");

    try {
      const shrunk = await shrinkImageForUpload(chosen);

      if (shrunk === chosen) {
        setNote(null);
        return;
      }

      // A file input's list is only writable through a DataTransfer. Assigning
      // it fires no change event, so this cannot loop back into here.
      if (typeof DataTransfer !== "function") {
        setNote(null);
        return;
      }

      const carrier = new DataTransfer();

      carrier.items.add(shrunk);
      input.files = carrier.files;

      const mb = (shrunk.size / (1024 * 1024)).toFixed(1);

      setNote(`Resized to ${mb} MB so it uploads.`);
    } finally {
      setPreparing(false);
    }
  }, []);

  return { onChange, preparing, note };
}
