"use client";

import { useActionState } from "react";
import { addJobMaterialAction, type JobFormState } from "@/lib/jobs/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState: JobFormState = {};

const MATERIALS = ["Rock salt", "Ice melt", "Sand", "Calcium", "Salt pucks", "Kindling"];

export function MaterialsForm({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState(addJobMaterialAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 rounded-3xl border-2 border-amber-200 bg-amber-50 p-5">
      <input type="hidden" name="jobId" value={jobId} />
      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">On site</p>
      <h2 className="text-2xl font-black text-slate-950">Log materials</h2>
      <p className="font-bold text-slate-700">
        Salt, sand, or pucks used on this visit. This is a field note, not a charge.
      </p>
      <label className="grid gap-1 font-black text-slate-800">
        Material
        <input
          name="materialName"
          list="material-names"
          required
          placeholder="Rock salt"
          className="h-12 rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold"
        />
        <datalist id="material-names">
          {MATERIALS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 font-black text-slate-800">
          Quantity
          <input
            name="quantity"
            type="number"
            min="0.1"
            step="0.1"
            required
            className="h-12 rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold"
          />
        </label>
        <label className="grid gap-1 font-black text-slate-800">
          Unit
          <input
            name="unit"
            required
            placeholder="bags, kg, pucks"
            className="h-12 rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold"
          />
        </label>
      </div>
      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle className="font-black">Material did not save</AlertTitle>
          <AlertDescription className="font-semibold">{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.message ? <p className="font-bold text-emerald-700">{state.message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-700 px-5 font-black text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save material"}
      </button>
    </form>
  );
}
