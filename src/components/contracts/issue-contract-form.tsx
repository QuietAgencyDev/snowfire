"use client";

import { useActionState } from "react";
import { issueContractAction, type ContractFormState } from "@/lib/contracts/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState: ContractFormState = {};

type IssueContractFormProps = {
  requestId: string;
  priceLabel: string;
  seasonLabel: string;
};

export function IssueContractForm({
  requestId,
  priceLabel,
  seasonLabel,
}: IssueContractFormProps) {
  const [state, formAction, pending] = useActionState(issueContractAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 rounded-2xl bg-emerald-50 p-4">
      <input type="hidden" name="requestId" value={requestId} />
      <p className="font-black text-slate-950">Issue the seasonal contract</p>
      <p className="font-bold text-slate-700">
        {priceLabel} for {seasonLabel}. Saved as a draft — activate it once the customer agrees.
        A mid-season start is prorated automatically.
      </p>
      <label className="grid gap-2 font-black">
        Billing
        <select
          name="billingFrequency"
          defaultValue="PREPAID"
          className="h-12 rounded-lg border-2 border-emerald-200 bg-white px-2.5 text-sm font-bold"
        >
          <option value="PREPAID">Prepaid in full — 8% off</option>
          <option value="MONTHLY">Monthly instalments</option>
        </select>
      </label>
      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle className="font-black">Unable to issue</AlertTitle>
          <AlertDescription className="font-semibold">{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-700 px-5 font-black text-white disabled:opacity-50"
      >
        {pending ? "Issuing…" : "Create contract"}
      </button>
    </form>
  );
}
