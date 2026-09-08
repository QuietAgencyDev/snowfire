import type { Metadata } from "next";
import Link from "next/link";
import { CreateStormForm } from "@/components/storms/create-storm-form";
import { StatusPill } from "@/components/bookings/status-pill";
import { listStorms } from "@/lib/storms/queries";

export const metadata: Metadata = {
  title: "Storms",
};

function stormTone(status: string) {
  if (status === "ACTIVE" || status === "PROCESSING") {
    return "ice" as const;
  }

  if (status === "COMPLETED") {
    return "forest" as const;
  }

  return "slate" as const;
}

export default async function AdminStormsPage() {
  const storms = await listStorms();

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl bg-gradient-to-r from-sky-900 to-slate-950 px-5 py-7 text-white">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200">
          Storm desk
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Weather is live. Jobs are not automatic.</h1>
        <p className="mt-3 max-w-2xl text-lg font-bold text-white/90">
          Score every pinned driveway against the forecast. Queue a visit only when you tap it.
          Stripe still waits.
        </p>
      </section>
      <CreateStormForm />
      <section className="grid gap-3">
        <h2 className="text-2xl font-black text-slate-950">Storms</h2>
        {storms.length === 0 ? (
          <p className="font-bold text-slate-600">
            No storm events yet. Ice risk already lives on each property pin.
          </p>
        ) : (
          storms.map((storm) => (
            <Link
              key={storm.id}
              href={`/admin/storms/${storm.id}`}
              className="rounded-3xl border-2 border-sky-100 bg-white p-4 hover:border-sky-400"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-black text-slate-950">{storm.name}</p>
                  <p className="font-bold text-sky-800">
                    {new Date(storm.start_time).toLocaleString("en-CA", {
                      timeZone: "America/Toronto",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  {storm.estimated_snowfall != null ? (
                    <p className="font-bold text-slate-600">{storm.estimated_snowfall} cm estimated</p>
                  ) : null}
                </div>
                <StatusPill label={storm.status.replaceAll("_", " ")} tone={stormTone(storm.status)} />
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
