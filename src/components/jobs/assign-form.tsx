"use client";

import { useActionState } from "react";
import { assignCrewAction, type JobFormState } from "@/lib/jobs/actions";
import type { Profile } from "@/types/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState: JobFormState = {};

type AssignFormProps = {
  jobId: string;
  crew: Profile[];
  assignedCrewId: string | null;
};

export function AssignForm({ jobId, crew, assignedCrewId }: AssignFormProps) {
  const [state, formAction, pending] = useActionState(assignCrewAction, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="jobId" value={jobId} />
      <label className="grid gap-2 font-black">
        Assign crew
        <select
          name="crewId"
          required
          defaultValue={assignedCrewId ?? ""}
          className="h-12 rounded-lg border-2 border-slate-200 bg-white px-2.5 text-sm font-bold"
        >
          <option value="" disabled>
            Choose crew
          </option>
          {crew.map((member) => (
            <option key={member.id} value={member.id}>
              {member.first_name} {member.last_name}
            </option>
          ))}
        </select>
      </label>
      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle className="font-black">Unable to assign</AlertTitle>
          <AlertDescription className="font-semibold">{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.message ? <p className="font-bold text-emerald-700">{state.message}</p> : null}
      <button
        type="submit"
        disabled={pending || crew.length === 0}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-950 px-5 font-black text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save assignment"}
      </button>
    </form>
  );
}
