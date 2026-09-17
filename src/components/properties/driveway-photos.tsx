"use client";

import { useActionState } from "react";
import {
  deletePropertyPhotoAction,
  uploadPropertyPhotoAction,
  type PropertyFormState,
} from "@/lib/properties/actions";
import type { PhotoType, PropertyPhotoView } from "@/types/database";
import { usePhotoShrink } from "@/components/photos/use-photo-shrink";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PropertyFormState = {};

type DrivewayPhotosProps = {
  propertyId: string;
  photoType: Extract<PhotoType, "DRIVEWAY" | "DRIVEWAY_FINISHED">;
  photos: PropertyPhotoView[];
  title: string;
  description: string;
};

export function DrivewayPhotos({
  propertyId,
  photoType,
  photos,
  title,
  description,
}: DrivewayPhotosProps) {
  const [state, formAction, pending] = useActionState(uploadPropertyPhotoAction, initialState);
  const photo = usePhotoShrink();

  return (
    <section className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-700">Photos</p>
      <h2 className="mt-1 text-2xl font-black text-slate-950">{title}</h2>
      <p className="mt-1 font-bold text-slate-700">{description}</p>
      <div className="mt-4 grid gap-4">
        {photos.length === 0 ? (
          <p className="font-bold text-indigo-800">No photos in this section yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {photos.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-lg border border-border">
                {photo.signedUrl ? (
                  // Signed storage URLs are short-lived and not in next/image remotePatterns.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.signedUrl}
                    alt={photo.caption || title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-muted text-sm text-muted-foreground">
                    Photo unavailable
                  </div>
                )}
                <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-muted-foreground">
                  <span className="truncate">{photo.caption || "Driveway photo"}</span>
                  <form action={deletePropertyPhotoAction}>
                    <input type="hidden" name="propertyId" value={propertyId} />
                    <input type="hidden" name="photoId" value={photo.id} />
                    <Button type="submit" variant="ghost" size="xs">
                      Remove
                    </Button>
                  </form>
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <form
          action={formAction}
          className="grid gap-3 rounded-2xl border-2 border-dashed border-indigo-200 bg-white p-3"
        >
          <input type="hidden" name="propertyId" value={propertyId} />
          <input type="hidden" name="photoType" value={photoType} />
          <div className="grid gap-2">
            <Label htmlFor={`${photoType}-photo`} className="font-black">
              Add photo
            </Label>
            <Input
              id={`${photoType}-photo`}
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={photo.onChange}
              className="h-12 border-2 border-indigo-100"
            />
            {photo.note ? (
              <p className="text-xs font-semibold text-indigo-800">{photo.note}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${photoType}-caption`} className="font-black">
              Caption
            </Label>
            <Input
              id={`${photoType}-caption`}
              name="caption"
              placeholder="Front apron, side walk, after last storm"
              className="h-12 border-2 border-indigo-100 font-semibold"
            />
          </div>
          {state.error ? (
            <Alert variant="destructive">
              <AlertTitle className="font-black">Unable to add photo</AlertTitle>
              <AlertDescription className="font-semibold">{state.error}</AlertDescription>
            </Alert>
          ) : null}
          {state.message ? (
            <Alert>
              <AlertTitle className="font-black">Saved</AlertTitle>
              <AlertDescription className="font-semibold">{state.message}</AlertDescription>
            </Alert>
          ) : null}
          <Button
            type="submit"
            disabled={pending || photo.preparing}
            className="h-12 w-fit bg-indigo-600 px-5 font-black text-white hover:bg-indigo-700"
          >
            {photo.preparing ? "Preparing…" : pending ? "Uploading…" : "Upload photo"}
          </Button>
        </form>
      </div>
    </section>
  );
}
