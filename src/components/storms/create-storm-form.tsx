"use client";

import { useActionState } from "react";
import { createStormAction, type StormFormState } from "@/lib/storms/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState: StormFormState = {};

export function CreateStormForm() {
  const [state, formAction, pending] = useActionState(createStormAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 rounded-3xl border-2 border-sky-200 bg-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">New storm</p>
      <h2 className="text-2xl font-black text-slate-950">Open a desk</h2>
      <p className="font-bold text-slate-700">
        Naming a storm does not dispatch a truck. Queue each driveway yourself.
      </p>
      <label className="grid gap-1 font-black text-slate-800">
        Name
        <input
          name="name"
          required
          placeholder="Friday lake-effect"
          className="h-12 rounded-xl border-2 border-slate-200 px-3 font-semibold"
        />
      </label>
      <label className="grid gap-1 font-black text-slate-800">
        Start (Eastern)
        <input
          name="startTime"
          type="datetime-local"
          required
          className="h-12 rounded-xl border-2 border-slate-200 px-3 font-semibold"
        />
      </label>
      <label className="grid gap-1 font-black text-slate-800">
        Estimated snow (cm)
        <input
          name="estimatedSnowfall"
          type="number"
          min="0"
          step="0.1"
          placeholder="Optional"
          className="h-12 rounded-xl border-2 border-slate-200 px-3 font-semibold"
        />
      </label>
      <label className="grid gap-1 font-black text-slate-800">
        Notes
        <textarea
          name="notes"
          placeholder="Wind, freezing rain, overnight glaze"
          className="min-h-20 rounded-xl border-2 border-slate-200 px-3 py-2 font-semibold"
        />
      </label>
      <label className="flex items-center gap-2 font-black text-slate-800">
        <input name="markActive" type="checkbox" className="h-4 w-4" />
        Mark active now
      </label>
      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle className="font-black">Storm did not save</AlertTitle>
          <AlertDescription className="font-semibold">{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.message ? <p className="font-bold text-emerald-700">{state.message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-sky-700 px-5 font-black text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save storm"}
      </button>
    </form>
  );
}
