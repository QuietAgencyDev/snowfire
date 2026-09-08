"use client";

import { useActionState } from "react";
import { updateStormStatusAction, type StormFormState } from "@/lib/storms/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { StormStatus } from "@/types/database";

const initialState: StormFormState = {};

const OPTIONS: { value: StormStatus; label: string }[] = [
  { value: "MONITORING", label: "Monitoring" },
  { value: "ACTIVE", label: "Active" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
];

export function StormStatusForm({
  stormId,
  status,
  actualSnowfall,
}: {
  stormId: string;
  status: StormStatus;
  actualSnowfall: string | number | null;
}) {
  const [state, formAction, pending] = useActionState(updateStormStatusAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 rounded-3xl border-2 border-slate-200 bg-white p-5">
      <input type="hidden" name="stormId" value={stormId} />
      <h2 className="text-2xl font-black text-slate-950">Storm status</h2>
      <label className="grid gap-1 font-black text-slate-800">
        Status
        <select
          name="status"
          defaultValue={status}
          className="h-12 rounded-xl border-2 border-slate-200 px-3 font-semibold"
        >
          {OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 font-black text-slate-800">
        Actual snow (cm)
        <input
          name="actualSnowfall"
          type="number"
          min="0"
          step="0.1"
          defaultValue={actualSnowfall ?? ""}
          placeholder="After the storm"
          className="h-12 rounded-xl border-2 border-slate-200 px-3 font-semibold"
        />
      </label>
      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle className="font-black">Status did not save</AlertTitle>
          <AlertDescription className="font-semibold">{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.message ? <p className="font-bold text-emerald-700">{state.message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-5 font-black text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Update storm"}
      </button>
    </form>
  );
}
