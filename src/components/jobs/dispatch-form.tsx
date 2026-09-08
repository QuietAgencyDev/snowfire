"use client";

import { useActionState } from "react";
import { dispatchJobAction, type JobFormState } from "@/lib/jobs/actions";
import type { Profile } from "@/types/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState: JobFormState = {};

type DispatchFormProps = {
  requestId: string;
  crew: Profile[];
};

export function DispatchForm({ requestId, crew }: DispatchFormProps) {
  const [state, formAction, pending] = useActionState(dispatchJobAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 rounded-2xl bg-slate-50 p-4">
      <input type="hidden" name="requestId" value={requestId} />
      <p className="font-black text-slate-950">Dispatch this visit</p>
      <p className="font-bold text-slate-700">
        Creates a real job. Assign crew now or leave it unassigned.
      </p>
      <label className="grid gap-2 font-black">
        Crew
        <select
          name="crewId"
          className="h-12 rounded-lg border-2 border-slate-200 bg-white px-2.5 text-sm font-bold"
          defaultValue=""
        >
          <option value="">Unassigned</option>
          {crew.map((member) => (
            <option key={member.id} value={member.id}>
              {member.first_name} {member.last_name}
            </option>
          ))}
        </select>
      </label>
      {crew.length === 0 ? (
        <p className="font-bold text-amber-800">
          No crew accounts yet. Promote a profile to CREW, then assign.
        </p>
      ) : null}
      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle className="font-black">Unable to dispatch</AlertTitle>
          <AlertDescription className="font-semibold">{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-950 px-5 font-black text-white disabled:opacity-50"
      >
        {pending ? "Dispatching…" : "Create job"}
      </button>
    </form>
  );
}
