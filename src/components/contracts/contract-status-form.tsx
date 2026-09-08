"use client";

import { useActionState } from "react";
import {
  updateContractStatusAction,
  type ContractFormState,
} from "@/lib/contracts/actions";
import { contractStatusLabel } from "@/lib/contracts/terms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ContractStatus } from "@/types/database";

const initialState: ContractFormState = {};

const STATUSES: ContractStatus[] = ["DRAFT", "ACTIVE", "PAUSED", "EXPIRED", "CANCELLED"];

type ContractStatusFormProps = {
  contractId: string;
  status: ContractStatus;
};

export function ContractStatusForm({ contractId, status }: ContractStatusFormProps) {
  const [state, formAction, pending] = useActionState(updateContractStatusAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 rounded-2xl bg-slate-50 p-4">
      <input type="hidden" name="contractId" value={contractId} />
      <p className="font-black text-slate-950">Contract status</p>
      <p className="font-bold text-slate-700">
        Activating tells the customer the season is booked. It does not charge anything.
      </p>
      <label className="grid gap-2 font-black">
        Status
        <select
          name="status"
          defaultValue={status}
          className="h-12 rounded-lg border-2 border-slate-200 bg-white px-2.5 text-sm font-bold"
        >
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {contractStatusLabel(value)}
            </option>
          ))}
        </select>
      </label>
      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle className="font-black">Unable to update</AlertTitle>
          <AlertDescription className="font-semibold">{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.message ? (
        <p className="font-bold text-emerald-800">{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-950 px-5 font-black text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save status"}
      </button>
    </form>
  );
}
