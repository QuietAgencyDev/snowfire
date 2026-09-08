"use client";

import { useState } from "react";
import Link from "next/link";
import { COMMAND_COPY, type AppLocale } from "@/lib/i18n/command";
import type { ReadinessReport } from "@/lib/properties/readiness";
import type { CoachTip } from "@/lib/properties/treatment-coach";
import type { IceRiskReport } from "@/lib/weather/ice-risk";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LocaleToggle } from "@/components/command/locale-toggle";
import { cn } from "@/lib/utils";

type CommandCenterProps = {
  propertyName: string;
  readiness: ReadinessReport;
  risk: IceRiskReport | null;
  tips: CoachTip[];
  briefHref: string;
};

const riskTone = {
  low: "from-emerald-500 to-sky-600",
  watch: "from-amber-400 to-orange-500",
  high: "from-orange-500 to-rose-600",
  severe: "from-rose-700 to-slate-900",
};

export function CommandCenter({
  propertyName,
  readiness,
  risk,
  tips,
  briefHref,
}: CommandCenterProps) {
  const [locale, setLocale] = useState<AppLocale>("en");
  const copy = COMMAND_COPY[locale];
  const snow = risk?.next48hSnowCm ?? 0;
  const snowWidth = Math.min(100, Math.round((snow / 15) * 100));

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-slate-950 px-5 py-4 text-white">
        <div className="flex items-center gap-4">
          <BrandLogo
            variant="shoveling"
            size="sm"
            className="-my-2 hidden h-24 w-auto shrink-0 sm:block"
          />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
              {copy.command}
            </p>
            <h2 className="mt-1 text-2xl font-black">{propertyName}</h2>
          </div>
        </div>
        <LocaleToggle onChange={setLocale} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5">
          <p className="text-xs font-black uppercase tracking-wide text-sky-700">
            {copy.readiness}
          </p>
          <p className="mt-2 text-6xl font-black text-sky-800">{readiness.score}</p>
          <p className="font-black text-slate-950">{readiness.headline}</p>
          <p className="mt-1 font-bold text-slate-700">{readiness.nextStep}</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-sky-100">
            <div
              className="h-full rounded-full bg-sky-600"
              style={{ width: `${readiness.score}%` }}
            />
          </div>
          <ul className="mt-4 grid gap-1">
            {readiness.checks.map((check) => (
              <li
                key={check.id}
                className={cn(
                  "font-bold",
                  check.done ? "text-emerald-700" : "text-slate-500",
                )}
              >
                {check.done ? "●" : "○"} {check.label}
              </li>
            ))}
          </ul>
        </article>

        <article
          className={cn(
            "rounded-3xl bg-gradient-to-br p-5 text-white",
            risk ? riskTone[risk.level] : "from-slate-400 to-slate-600",
          )}
        >
          <p className="text-xs font-black uppercase tracking-wide text-white/80">
            {copy.ice}
          </p>
          <p className="mt-2 text-4xl font-black">{risk ? risk.score : "—"}</p>
          <p className="text-xl font-black">{risk?.label ?? "Pin the address"}</p>
          <p className="mt-2 font-bold text-white/90">
            {risk?.detail ?? "Ice risk uses the hourly forecast on this driveway."}
          </p>
          {risk ? (
            <p className="mt-4 font-black">
              {risk.freezeThawCount} freeze-thaws · {risk.glazeHours} glaze hours
            </p>
          ) : null}
        </article>

        <article className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5">
          <p className="text-xs font-black uppercase tracking-wide text-indigo-700">
            {copy.storm}
          </p>
          <p className="mt-2 text-5xl font-black text-indigo-900">
            {snow.toFixed(1)}
            <span className="text-2xl"> cm</span>
          </p>
          <p className="font-bold text-slate-700">Expected on this pin, next 48 hours.</p>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-indigo-100">
            <div
              className="h-full rounded-full bg-indigo-600"
              style={{ width: `${snowWidth}%` }}
            />
          </div>
          <Link
            href={briefHref}
            className="mt-5 inline-flex h-12 items-center rounded-xl bg-indigo-600 px-4 font-black text-white"
          >
            {copy.briefCta}
          </Link>
        </article>
      </div>

      {risk?.iceDamWatch ? (
        <article className="rounded-3xl border-2 border-amber-300 bg-gradient-to-r from-amber-200 to-orange-200 px-5 py-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-900">
            {copy.iceDam}
          </p>
          <p className="mt-1 text-lg font-black text-slate-950">{copy.iceDamDetail}</p>
        </article>
      ) : null}

      <article className="rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5">
        <p className="text-xs font-black uppercase tracking-wide text-orange-700">
          {copy.coach}
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {tips.map((tip) => (
            <div key={tip.title} className="rounded-2xl bg-white p-4">
              <p className="font-black text-slate-950">{tip.title}</p>
              <p className="mt-1 font-bold text-slate-700">{tip.detail}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
