import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewRequestForm } from "@/components/admin/review-request-form";
import { StatusPill } from "@/components/bookings/status-pill";
import { IssueContractForm } from "@/components/contracts/issue-contract-form";
import { DispatchForm } from "@/components/jobs/dispatch-form";
import { getAdminRequest } from "@/lib/bookings/queries";
import { hasLiveContract } from "@/lib/contracts/queries";
import { prorateSeason, seasonWindow } from "@/lib/contracts/terms";
import { todayInTimeZone } from "@/lib/pricing/quote-math";
import { listCrewMembers } from "@/lib/jobs/queries";
import { requestStatusLabel } from "@/lib/bookings/labels";
import { quoteSnowService } from "@/lib/pricing/quote-math";
import { quoteSnowRateForProperty } from "@/lib/pricing/rate-card";
import { getPropertyForStaff } from "@/lib/properties/queries";
import { getOntarioTaxBps } from "@/lib/settings/queries";
import { applyTaxBps, formatCadFromCents } from "@/lib/money";

export const metadata: Metadata = {
  title: "Review visit",
};

export default async function AdminRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [request, crew] = await Promise.all([getAdminRequest(id), listCrewMembers()]);

  if (!request) {
    notFound();
  }

  const [property, taxBps] = await Promise.all([
    getPropertyForStaff(request.property_id),
    getOntarioTaxBps(),
  ]);
  const rate = property ? quoteSnowRateForProperty(request.service_type, property) : null;
  const quote = quoteSnowService({
    basePrice: request.base_price,
    pricingModel: request.pricing_model,
  });
  const open = request.status === "ADMIN_REVIEW" || request.status === "CUSTOMER_REQUESTED";
  const seasonal = request.service_type === "SEASONAL" && rate !== null;
  const alreadyContracted = seasonal ? await hasLiveContract(request.property_id) : false;
  const season = seasonal ? seasonWindow(rate.market, todayInTimeZone("America/Toronto")) : null;
  const prorated =
    season && rate
      ? prorateSeason(rate.amountCents, season, todayInTimeZone("America/Toronto"))
      : null;

  return (
    <div className="grid gap-5">
      <Link href="/admin" className="font-black text-sky-800 underline">
        Back to inbox
      </Link>
      <article className="rounded-3xl border-2 border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black text-slate-950">{request.service_name}</h1>
            <p className="mt-2 text-lg font-bold text-sky-800">{request.customer_name}</p>
            <p className="font-bold text-slate-700">{request.customer_email}</p>
            <p className="mt-2 font-bold text-slate-800">{request.property_name}</p>
            <p className="font-bold text-slate-700">{request.property_address}</p>
          </div>
          <StatusPill label={requestStatusLabel(request.status)} tone="ice" />
        </div>
        <dl className="mt-6 grid gap-3 font-bold text-slate-800">
          <div>
            <dt className="font-black text-slate-500">When</dt>
            <dd>{request.requested_date} · {request.preferred_time || "First available"}</dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Price</dt>
            {rate ? (
              <dd>
                {formatCadFromCents(rate.amountCents)} {rate.unitLabel} ·{" "}
                {formatCadFromCents(rate.amountCents + applyTaxBps(rate.amountCents, taxBps))} with
                HST
                <span className="block font-bold text-slate-600">
                  {rate.marketLabel} card · {rate.drivewayClassLabel} · rolls at {rate.triggerCm} cm
                  {rate.measured ? "" : " · driveway not measured, class assumed"}
                </span>
              </dd>
            ) : (
              <dd>{quote.custom ? quote.label : formatCadFromCents(quote.amountCents)}</dd>
            )}
          </div>
          <div>
            <dt className="font-black text-slate-500">Customer notes</dt>
            <dd>{request.customer_notes || "None"}</dd>
          </div>
          {request.admin_notes ? (
            <div>
              <dt className="font-black text-slate-500">Operations notes</dt>
              <dd>{request.admin_notes}</dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-6 grid gap-4">
          {open ? <ReviewRequestForm requestId={request.id} /> : null}
          {request.status === "APPROVED" && season && prorated && !alreadyContracted ? (
            <IssueContractForm
              requestId={request.id}
              priceLabel={formatCadFromCents(prorated.amountCents)}
              seasonLabel={`${season.label} (${prorated.startDate} to ${season.endDate})`}
            />
          ) : null}
          {alreadyContracted ? (
            <p className="font-bold text-slate-700">
              This driveway already has a live contract. Open{" "}
              <Link href="/admin/contracts" className="text-sky-800 underline">
                contracts
              </Link>
              .
            </p>
          ) : null}
          {request.status === "APPROVED" ? (
            <DispatchForm requestId={request.id} crew={crew} />
          ) : null}
          {request.status === "CONVERTED_TO_JOB" ? (
            <p className="font-bold text-slate-600">
              This visit is a job. Open{" "}
              <Link href="/admin/jobs" className="text-sky-800 underline">
                jobs
              </Link>
              .
            </p>
          ) : null}
          {!open && request.status !== "APPROVED" && request.status !== "CONVERTED_TO_JOB" ? (
            <p className="font-bold text-slate-600">This request is no longer in review.</p>
          ) : null}
        </div>
      </article>
    </div>
  );
}
