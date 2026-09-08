"use client";

import { useActionState } from "react";
import {
  addPropertyZoneAction,
  deletePropertyZoneAction,
  type ZoneFormState,
} from "@/lib/properties/zone-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { PropertyZone } from "@/types/database";

const initialState: ZoneFormState = {};

export function ZoneManager({
  propertyId,
  zones,
}: {
  propertyId: string;
  zones: PropertyZone[];
}) {
  const [state, formAction, pending] = useActionState(addPropertyZoneAction, initialState);

  return (
    <section className="grid gap-4 rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
          Commercial
        </p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">Service zones</h2>
        <p className="mt-1 font-bold text-slate-700">
          Named lots, docks, or walks. Empty until you add one. No crew is assigned from here.
        </p>
      </div>
      {zones.length === 0 ? (
        <p className="font-bold text-slate-600">No zones on this property yet.</p>
      ) : (
        <ul className="grid gap-2">
          {zones.map((zone) => (
            <li
              key={zone.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border-2 border-emerald-100 bg-white p-4"
            >
              <div>
                <p className="font-black text-slate-950">{zone.name}</p>
                <p className="font-bold text-emerald-800">{zone.priority.toLowerCase()} priority</p>
                {zone.instructions ? (
                  <p className="mt-1 font-bold text-slate-700">{zone.instructions}</p>
                ) : null}
              </div>
              <form action={deletePropertyZoneAction}>
                <input type="hidden" name="zoneId" value={zone.id} />
                <input type="hidden" name="propertyId" value={propertyId} />
                <button type="submit" className="font-black text-slate-500 underline">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <form action={formAction} className="grid gap-3">
        <input type="hidden" name="propertyId" value={propertyId} />
        <label className="grid gap-1 font-black text-slate-800">
          Zone name
          <input
            name="name"
            required
            placeholder="Front lot"
            className="h-12 rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold"
          />
        </label>
        <label className="grid gap-1 font-black text-slate-800">
          Priority
          <select
            name="priority"
            defaultValue="NORMAL"
            className="h-12 rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold"
          >
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </label>
        <label className="grid gap-1 font-black text-slate-800">
          Instructions
          <textarea
            name="instructions"
            placeholder="Salt the dock first. Leave the loading bay."
            className="min-h-20 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 font-semibold"
          />
        </label>
        {state.error ? (
          <Alert variant="destructive">
            <AlertTitle className="font-black">Zone did not save</AlertTitle>
            <AlertDescription className="font-semibold">{state.error}</AlertDescription>
          </Alert>
        ) : null}
        {state.message ? <p className="font-bold text-emerald-700">{state.message}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-700 px-5 font-black text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Add zone"}
        </button>
      </form>
    </section>
  );
}
