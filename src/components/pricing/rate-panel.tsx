import Link from "next/link";
import { applyTaxBps, formatCadFromCents } from "@/lib/money";
import { quoteSnowRateForProperty } from "@/lib/pricing/rate-card";
import type { Property } from "@/types/database";

type RatePanelProps = {
  property: Property;
  taxBps: number;
};

export function RatePanel({ property, taxBps }: RatePanelProps) {
  const season = quoteSnowRateForProperty("SEASONAL", property);
  const visit = quoteSnowRateForProperty("ONE_TIME", property);

  if (!season || !visit) {
    return null;
  }

  const seasonTotal = season.amountCents + applyTaxBps(season.amountCents, taxBps);
  const visitTotal = visit.amountCents + applyTaxBps(visit.amountCents, taxBps);

  return (
    <section className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Your rate</h2>
          <p className="mt-1 font-bold text-slate-700">
            {season.marketLabel} card · {season.drivewayClassLabel} driveway · crew rolls at{" "}
            {season.triggerCm} cm
          </p>
        </div>
        <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white">
          {season.season}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-emerald-300 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-800">
            Full season
          </p>
          <p className="mt-1 text-3xl font-black text-slate-950">
            {formatCadFromCents(season.amountCents)}
          </p>
          <p className="mt-1 font-bold text-slate-600">
            {formatCadFromCents(seasonTotal)} with HST · unlimited visits
          </p>
        </div>
        <div className="rounded-2xl border-2 border-sky-200 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-800">
            Single visit
          </p>
          <p className="mt-1 text-3xl font-black text-slate-950">
            {formatCadFromCents(visit.amountCents)}
          </p>
          <p className="mt-1 font-bold text-slate-600">
            {formatCadFromCents(visitTotal)} with HST · one storm
          </p>
        </div>
      </div>

      {season.measured ? null : (
        <p className="mt-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3 font-bold text-slate-800">
          This assumes a standard {season.drivewayClassLabel.toLowerCase()} driveway.{" "}
          <Link
            href={`/customer/properties/${property.id}/edit`}
            className="font-black text-amber-900 underline"
          >
            Add your driveway length and width
          </Link>{" "}
          for a rate that matches the actual site.
        </p>
      )}

      {season.trigger === "PRIORITY" ? (
        <p className="mt-3 font-bold text-slate-700">
          Priority dispatch is on, so the crew rolls at 2.5 cm instead of 5 cm.
        </p>
      ) : (
        <p className="mt-3 font-bold text-slate-700">
          Want it cleared before the morning commute?{" "}
          <Link
            href={`/customer/properties/${property.id}/edit`}
            className="font-black text-emerald-900 underline"
          >
            Turn on priority dispatch
          </Link>{" "}
          to drop the trigger to 2.5 cm.
        </p>
      )}

      <Link
        href={`/customer/book?property=${property.id}`}
        className="mt-4 inline-flex h-12 items-center rounded-xl bg-emerald-700 px-5 font-black text-white hover:bg-emerald-800"
      >
        Request a visit
      </Link>
      <p className="mt-2 font-bold text-slate-600">
        This is the published rate for this driveway. Operations confirms it before any crew is
        dispatched, and nothing is charged here.
      </p>
    </section>
  );
}
