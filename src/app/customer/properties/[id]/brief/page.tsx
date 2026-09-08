import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { propertyCoordinates } from "@/lib/properties/address";
import { buildCrewBrief, crewBriefText } from "@/lib/properties/crew-brief";
import { getCustomerProperty } from "@/lib/properties/queries";
import { iceRisk } from "@/lib/weather/ice-risk";
import { getLocalWeatherReport } from "@/lib/weather/open-meteo";
import { CopyBriefButton } from "@/components/command/copy-brief-button";
import { PrintButton } from "@/components/command/print-button";

export const metadata: Metadata = {
  title: "Crew brief",
};

export default async function CrewBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getSessionProfile();

  if (!profile) {
    notFound();
  }

  const property = await getCustomerProperty(id, profile.id);

  if (!property) {
    notFound();
  }

  const coordinates = propertyCoordinates(property);
  const weather = coordinates
    ? await getLocalWeatherReport(coordinates.latitude, coordinates.longitude)
    : null;
  const risk = weather ? iceRisk(weather) : null;
  const brief = buildCrewBrief({ property, profile, weather, risk });
  const text = crewBriefText(brief);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/customer/properties/${property.id}`} className="font-black text-sky-800 underline">
          Back to property
        </Link>
        <div className="flex flex-wrap gap-2">
          <CopyBriefButton text={text} />
          <PrintButton />
        </div>
      </div>

      <article className="rounded-3xl border-2 border-slate-900 bg-white p-6 print:border-0">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
          SnowFire.ca · fiche équipe / crew brief
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">{brief.title}</h1>
        <p className="mt-2 text-xl font-bold text-sky-800">{brief.address}</p>
        <p className="mt-1 font-black text-slate-800">
          {brief.client} · {brief.phone}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl bg-sky-50 p-4">
            <h2 className="font-black text-sky-900">Weather on this pin</h2>
            <p className="mt-1 font-bold">{brief.weatherLine}</p>
            <p className="mt-1 font-bold">{brief.iceLine}</p>
          </section>
          <section className="rounded-2xl bg-orange-50 p-4">
            <h2 className="font-black text-orange-900">Driveway</h2>
            <p className="mt-1 font-bold">Surface: {brief.surface}</p>
            <p className="mt-1 font-bold">Snow storage: {brief.storage}</p>
          </section>
          <section className="rounded-2xl bg-amber-50 p-4 md:col-span-2">
            <h2 className="font-black text-amber-900">Roof salt pucks</h2>
            <p className="mt-1 font-bold">
              {brief.roofType} · {brief.puckCount} pucks
            </p>
            <p className="mt-1 font-bold">{brief.roof.join(" · ") || "Roof service not checked"}</p>
            <p className="mt-1 font-bold">{brief.roofNotes}</p>
          </section>
        </div>

        <dl className="mt-6 grid gap-3 font-bold">
          <div>
            <dt className="font-black text-slate-500">Treatment / traitement</dt>
            <dd>{brief.treatments.join(" · ") || "None checked"}</dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Clear / déneiger</dt>
            <dd>{brief.areas.join(" · ") || "None checked"}</dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Site</dt>
            <dd>{brief.site.join(" · ") || "None checked"}</dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Hazards / dangers</dt>
            <dd>{brief.hazards}</dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Instructions</dt>
            <dd>{brief.instructions}</dd>
          </div>
        </dl>

        <p className="mt-8 text-sm font-bold text-slate-500">
          This is the property file. It is not a booked job and it does not invent a visit.
        </p>
      </article>
    </div>
  );
}
