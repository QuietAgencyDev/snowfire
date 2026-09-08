"use client";

import { useActionState } from "react";
import { reviewWoodRequestAction, type WoodOrderFormState } from "@/lib/firewood/order-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState: WoodOrderFormState = {};

export function ReviewWoodForm({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState(reviewWoodRequestAction, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle className="font-black">Unable to review</AlertTitle>
          <AlertDescription className="font-semibold">{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          name="decision"
          value="CONFIRMED"
          disabled={pending}
          className="inline-flex h-12 items-center rounded-xl bg-orange-600 px-5 font-black text-white hover:bg-orange-700 disabled:opacity-50"
        >
          Accept load
        </button>
        <button
          type="submit"
          name="decision"
          value="CANCELLED"
          disabled={pending}
          className="inline-flex h-12 items-center rounded-xl border-2 border-slate-300 px-5 font-black text-slate-800 disabled:opacity-50"
        >
          Decline
        </button>
      </div>
      <p className="font-bold text-slate-600">
        Accept holds inventory. It still does not take a card payment.
      </p>
    </form>
  );
}
