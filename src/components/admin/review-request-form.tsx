"use client";

import { useActionState } from "react";
import { reviewBookingRequestAction, type BookingFormState } from "@/lib/bookings/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

const initialState: BookingFormState = {};

export function ReviewRequestForm({ requestId }: { requestId: string }) {
  const [state, formAction, pending] = useActionState(reviewBookingRequestAction, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="requestId" value={requestId} />
      <Textarea
        name="adminNotes"
        placeholder="Optional note to the customer"
        className="border-2 border-slate-200 font-semibold"
      />
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
          value="APPROVED"
          disabled={pending}
          className="inline-flex h-12 items-center rounded-xl bg-emerald-600 px-5 font-black text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Approve visit
        </button>
        <button
          type="submit"
          name="decision"
          value="DECLINED"
          disabled={pending}
          className="inline-flex h-12 items-center rounded-xl border-2 border-slate-300 px-5 font-black text-slate-800 disabled:opacity-50"
        >
          Decline
        </button>
      </div>
      <p className="font-bold text-slate-600">
        Approve does not dispatch a crew. Use Create job after this.
      </p>
    </form>
  );
}
