"use client";

import { useActionState } from "react";
import { advanceJobAction, uploadJobPhotoAction, type JobFormState } from "@/lib/jobs/actions";
import { nextCrewAction, type JobStatus } from "@/lib/jobs/transitions";
import { usePhotoShrink } from "@/components/photos/use-photo-shrink";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState: JobFormState = {};

type CrewJobControlsProps = {
  jobId: string;
  status: JobStatus;
  beforeCount: number;
  afterCount: number;
  crewNotes: string | null;
};

export function CrewJobControls({
  jobId,
  status,
  beforeCount,
  afterCount,
  crewNotes,
}: CrewJobControlsProps) {
  const [moveState, moveAction, movePending] = useActionState(advanceJobAction, initialState);
  const [photoState, photoAction, photoPending] = useActionState(uploadJobPhotoAction, initialState);
  const photo = usePhotoShrink();
  const next = nextCrewAction(status);
  const needBefore = status === "ARRIVED" && beforeCount === 0;
  const needAfter = status === "IN_PROGRESS" && afterCount === 0;
  const photoType = needAfter ? "AFTER" : "BEFORE";
  const showPhoto = needBefore || needAfter;

  return (
    <div className="grid gap-4">
      {showPhoto ? (
        <form action={photoAction} className="grid gap-3 rounded-3xl bg-violet-50 p-4">
          <input type="hidden" name="jobId" value={jobId} />
          <input type="hidden" name="photoType" value={photoType} />
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-800">
            {photoType} photo
          </p>
          <h2 className="text-2xl font-black text-slate-950">
            {photoType === "BEFORE" ? "Photo the driveway first" : "Photo the finished work"}
          </h2>
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={photo.onChange}
            className="font-bold"
          />
          {photo.note ? (
            <p className="font-bold text-violet-900">{photo.note}</p>
          ) : null}
          {photoState.error ? (
            <Alert variant="destructive">
              <AlertTitle className="font-black">Photo did not save</AlertTitle>
              <AlertDescription className="font-semibold">{photoState.error}</AlertDescription>
            </Alert>
          ) : null}
          {photoState.message ? (
            <p className="font-bold text-emerald-700">{photoState.message}</p>
          ) : null}
          <button
            type="submit"
            disabled={photoPending || photo.preparing}
            className="inline-flex h-16 items-center justify-center rounded-2xl bg-violet-700 px-5 text-xl font-black text-white disabled:opacity-50"
          >
            {photo.preparing
              ? "Preparing…"
              : photoPending
                ? "Uploading…"
                : `Save ${photoType} photo`}
          </button>
        </form>
      ) : null}

      {next && !needBefore && !needAfter ? (
        <form action={moveAction} className="grid gap-3">
          <input type="hidden" name="jobId" value={jobId} />
          <input type="hidden" name="toStatus" value={next.to} />
          <label className="grid gap-2 font-black">
            Crew notes
            <textarea
              name="crewNotes"
              defaultValue={crewNotes ?? ""}
              placeholder="Salt used, ice on the north walk, cars moved"
              className="min-h-24 rounded-xl border-2 border-slate-200 px-3 py-2 font-semibold"
            />
          </label>
          {moveState.error ? (
            <Alert variant="destructive">
              <AlertTitle className="font-black">Unable to move the job</AlertTitle>
              <AlertDescription className="font-semibold">{moveState.error}</AlertDescription>
            </Alert>
          ) : null}
          <button
            type="submit"
            disabled={movePending}
            className="inline-flex h-20 items-center justify-center rounded-2xl bg-sky-700 px-5 text-2xl font-black text-white disabled:opacity-50"
          >
            {movePending ? "Saving…" : next.label}
          </button>
        </form>
      ) : null}
    </div>
  );
}
