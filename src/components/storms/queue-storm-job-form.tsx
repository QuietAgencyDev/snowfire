"use client";

import { useActionState } from "react";
import { queueStormJobAction, type StormFormState } from "@/lib/storms/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState: StormFormState = {};

type QueueStormJobFormProps = {
  stormId: string;
  propertyId: string;
  disabled?: boolean;
  label: string;
};

export function QueueStormJobForm({
  stormId,
  propertyId,
  disabled,
  label,
}: QueueStormJobFormProps) {
  const [state, formAction, pending] = useActionState(queueStormJobAction, initialState);

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="stormId" value={stormId} />
      <input type="hidden" name="propertyId" value={propertyId} />
      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle className="font-black">Not queued</AlertTitle>
          <AlertDescription className="font-semibold">{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.message ? <p className="font-bold text-emerald-700">{state.message}</p> : null}
      <button
        type="submit"
        disabled={pending || disabled}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-orange-600 px-4 font-black text-white disabled:opacity-50"
      >
        {pending ? "Queueing…" : label}
      </button>
    </form>
  );
}
