import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/bookings/status-pill";
import { QueueStormJobForm } from "@/components/storms/queue-storm-job-form";
import { StormStatusForm } from "@/components/storms/storm-status-form";
import { listOpenJobPropertyIds } from "@/lib/jobs/queries";
import { formatPropertyAddress, propertyCoordinates } from "@/lib/properties/address";
import {
  getDefaultStormService,
  getStorm,
  listAdminProperties,
} from "@/lib/storms/queries";
import { stormJobPriority, stormWatchScore } from "@/lib/storms/priority";
import { iceRisk } from "@/lib/weather/ice-risk";
import { getLocalWeatherReport } from "@/lib/weather/open-meteo";

export const metadata: Metadata = {
  title: "Storm",
};

const WEATHER_CAP = 20;

export default async function AdminStormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [storm, properties, openIds, service] = await Promise.all([
    getStorm(id),
    listAdminProperties(),
    listOpenJobPropertyIds(),
    getDefaultStormService(),
  ]);

  if (!storm) {
    notFound();
  }

  const pinned = properties.filter((property) => propertyCoordinates(property));
  const weatherTargets = pinned.slice(0, WEATHER_CAP);
  const reports = await Promise.all(
    weatherTargets.map(async (property) => {
      const coords = propertyCoordinates(property);

      if (!coords) {
        return { id: property.id, risk: null as ReturnType<typeof iceRisk> | null };
      }

      const weather = await getLocalWeatherReport(coords.latitude, coords.longitude);
      return { id: property.id, risk: weather ? iceRisk(weather) : null };
    }),
  );
  const riskById = new Map(reports.map((row) => [row.id, row.risk]));

  const ranked = [...properties]
    .map((property) => {
      const coords = propertyCoordinates(property);
      const risk = riskById.get(property.id) ?? null;
      const hasOpenJob = openIds.has(property.id);
      const score = stormWatchScore({
        iceScore: risk?.score ?? 0,
        next48hSnowCm: risk?.next48hSnowCm ?? 0,
        hasOpenJob,
        hasPin: Boolean(coords),
      });

      return { property, risk, hasOpenJob, score, hasPin: Boolean(coords) };
    })
    .sort((left, right) => right.score - left.score);

  return (
    <div className="grid gap-6">
      <Link href="/admin/storms" className="font-black text-sky-800 underline">
        Back to storms
      </Link>
      <section className="rounded-3xl bg-gradient-to-r from-sky-800 to-slate-950 px-5 py-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-200">
          {storm.status.replaceAll("_", " ")}
        </p>
        <h1 className="mt-2 text-4xl font-black">{storm.name}</h1>
        <p className="mt-2 text-lg font-bold text-white/90">
          {new Date(storm.start_time).toLocaleString("en-CA", {
            timeZone: "America/Toronto",
            dateStyle: "medium",
            timeStyle: "short",
          })}
          {storm.estimated_snowfall != null ? ` · ${storm.estimated_snowfall} cm estimated` : ""}
        </p>
        {storm.notes ? <p className="mt-2 font-bold text-white/80">{storm.notes}</p> : null}
        <p className="mt-3 font-bold text-amber-100">
          {service
            ? `Queue uses ${service.name}. Still unassigned until you pick crew.`
            : "Add a snow service to the catalog before queueing a driveway."}
        </p>
      </section>
      <StormStatusForm
        stormId={storm.id}
        status={storm.status}
        actualSnowfall={storm.actual_snowfall}
      />
      <section className="grid gap-3">
        <h2 className="text-2xl font-black text-slate-950">Driveway watch</h2>
        {properties.length === 0 ? (
          <p className="font-bold text-slate-600">
            No properties on file. This board does not invent driveways.
          </p>
        ) : (
          ranked.map(({ property, risk, hasOpenJob, hasPin }) => (
            <article
              key={property.id}
              className="rounded-3xl border-2 border-sky-100 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950">{property.name}</p>
                  <p className="font-bold text-sky-800">{property.customer_name}</p>
                  <p className="font-bold text-slate-700">{formatPropertyAddress(property)}</p>
                  {risk ? (
                    <p className="mt-2 font-bold text-slate-800">
                      {risk.label} · {risk.next48hSnowCm} cm / 48h ·{" "}
                      {stormJobPriority(risk.level).toLowerCase()} if queued
                    </p>
                  ) : (
                    <p className="mt-2 font-bold text-slate-600">
                      {hasPin
                        ? "Weather did not load for this pin."
                        : "Pin this address to score ice risk."}
                    </p>
                  )}
                </div>
                {hasOpenJob ? (
                  <StatusPill label="Open job" tone="forest" />
                ) : (
                  <QueueStormJobForm
                    stormId={storm.id}
                    propertyId={property.id}
                    disabled={!service}
                    label="Queue visit"
                  />
                )}
              </div>
            </article>
          ))
        )}
        {pinned.length > WEATHER_CAP ? (
          <p className="font-bold text-slate-600">
            Ice scores loaded for the first {WEATHER_CAP} pinned properties.
          </p>
        ) : null}
      </section>
    </div>
  );
}
