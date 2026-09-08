import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/bookings/status-pill";
import { getSessionProfile } from "@/lib/auth/session";
import { cancelBookingRequestAction } from "@/lib/bookings/actions";
import { customerCanCancelRequest, requestStatusLabel } from "@/lib/bookings/labels";
import { getCustomerRequest } from "@/lib/bookings/queries";
import { quoteSnowService } from "@/lib/pricing/quote-math";
import { formatCadFromCents } from "@/lib/money";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Visit request",
};

export default async function CustomerRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getSessionProfile();

  if (!profile) {
    notFound();
  }

  const request = await getCustomerRequest(id, profile.id);

  if (!request) {
    notFound();
  }

  const quote = quoteSnowService({
    basePrice: request.base_price,
    pricingModel: request.pricing_model,
  });

  return (
    <div className="grid gap-5">
      <Link href="/customer/requests" className="font-black text-sky-800 underline">
        Back to requests
      </Link>
      <article className="rounded-3xl border-2 border-sky-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
              Snow visit
            </p>
            <h1 className="mt-2 text-4xl font-black text-slate-950">{request.service_name}</h1>
            <p className="mt-2 text-lg font-bold text-sky-800">{request.property_name}</p>
            <p className="font-bold text-slate-700">{request.property_address}</p>
          </div>
          <StatusPill
            label={requestStatusLabel(request.status)}
            tone={request.status === "APPROVED" ? "forest" : "ice"}
          />
        </div>
        <dl className="mt-6 grid gap-3 font-bold text-slate-800">
          <div>
            <dt className="font-black text-slate-500">Requested date</dt>
            <dd>{request.requested_date} · {request.preferred_time || "First available"}</dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Price</dt>
            <dd>{quote.custom ? quote.label : formatCadFromCents(quote.amountCents)}</dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Your notes</dt>
            <dd>{request.customer_notes || "None"}</dd>
          </div>
          {request.admin_notes ? (
            <div>
              <dt className="font-black text-slate-500">Operations notes</dt>
              <dd>{request.admin_notes}</dd>
            </div>
          ) : null}
        </dl>
        <p className="mt-6 font-bold text-slate-600">
          Approved visits become jobs when operations dispatches a crew.
        </p>
        {customerCanCancelRequest(request.status) ? (
          <form action={cancelBookingRequestAction} className="mt-5">
            <input type="hidden" name="requestId" value={request.id} />
            <Button type="submit" variant="outline" className="h-12 border-2 font-black">
              Cancel this request
            </Button>
          </form>
        ) : null}
      </article>
    </div>
  );
}
