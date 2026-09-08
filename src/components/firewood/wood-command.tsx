import Link from "next/link";
import type { WoodReadinessReport } from "@/lib/firewood/readiness";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WoodCommandProps = {
  propertyName: string;
  readiness: WoodReadinessReport;
  editHref: string;
  briefHref: string;
};

export function WoodCommand({
  propertyName,
  readiness,
  editHref,
  briefHref,
}: WoodCommandProps) {
  return (
    <section className="rounded-3xl border-2 border-orange-300 bg-gradient-to-br from-orange-600 to-amber-700 p-5 text-white">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-100">
        Wood yard
      </p>
      <h2 className="mt-1 text-2xl font-black">{propertyName}</h2>
      <p className="mt-2 text-5xl font-black">{readiness.score}</p>
      <p className="font-black">{readiness.headline}</p>
      <p className="mt-1 font-bold text-white/90">{readiness.nextStep}</p>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-amber-200"
          style={{ width: `${readiness.score}%` }}
        />
      </div>
      <ul className="mt-4 grid gap-1">
        {readiness.checks.map((check) => (
          <li key={check.id} className="font-bold text-white/90">
            {check.done ? "●" : "○"} {check.label}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/customer/firewood"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "h-12 bg-white px-4 font-black text-slate-950",
          )}
        >
          Open the yard
        </Link>
        <Link
          href={briefHref}
          className="inline-flex h-12 items-center rounded-xl border-2 border-white/40 px-4 font-black text-white"
        >
          Delivery brief
        </Link>
        <Link
          href={editHref}
          className="inline-flex h-12 items-center px-3 font-black text-amber-100 underline"
        >
          Edit woodshed file
        </Link>
      </div>
    </section>
  );
}
