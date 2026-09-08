"use client";

import { weatherAdvice } from "@/lib/weather/advice";
import { weatherIcon, weatherTone, weatherToneClasses } from "@/lib/weather/visual";
import type { LocalWeatherReport } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

type PropertyWeatherProps = {
  address: string;
  report: LocalWeatherReport | null;
  compact?: boolean;
};

function formatTemp(value: number | null | undefined) {
  if (value == null) {
    return "—";
  }

  return `${Math.round(value)}°`;
}

function formatHour(time: string) {
  return new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
  }).format(new Date(time));
}

function formatDay(date: string) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
  }).format(new Date(`${date}T12:00:00`));
}

export function PropertyWeather({ address, report, compact = false }: PropertyWeatherProps) {
  if (!report) {
    return (
      <section className="rounded-3xl border-2 border-dashed border-sky-300 bg-sky-50 px-5 py-6">
        <p className="text-lg font-black text-sky-900">Local weather is waiting on the address</p>
        <p className="mt-2 font-semibold text-sky-800">
          Enter the street and city, then tap See my weather. We pin this driveway — not a
          generic city station.
        </p>
      </section>
    );
  }

  const tone = weatherTone(report.weatherCode, report.snowfallCm ?? 0);
  const HeroIcon = weatherIcon(report.weatherCode);
  const advice = weatherAdvice(report);
  const days = compact ? report.daily.slice(0, 4) : report.daily;
  const hours = compact ? report.hourly.slice(0, 8) : report.hourly;

  return (
    <section className="overflow-hidden rounded-3xl shadow-lg shadow-sky-900/10">
      <div className={cn("bg-gradient-to-br px-5 py-6 sm:px-7", weatherToneClasses(tone))}>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-white/80">
          Live at this property
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <HeroIcon className="size-14 drop-shadow-md" />
              <p className="text-6xl font-black leading-none tracking-tight">
                {formatTemp(report.temperatureC)}
                <span className="text-3xl">C</span>
              </p>
            </div>
            <p className="mt-3 text-2xl font-black">{report.summary}</p>
            <p className="mt-1 font-bold text-white/85">{address}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm font-bold">
            <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
              <p className="text-white/70">Feels</p>
              <p>{formatTemp(report.apparentTemperatureC)}C</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
              <p className="text-white/70">Wind</p>
              <p>{report.windKmh == null ? "—" : `${Math.round(report.windKmh)} km/h`}</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
              <p className="text-white/70">Snow now</p>
              <p>{report.snowfallCm == null ? "0 cm" : `${report.snowfallCm.toFixed(1)} cm`}</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
              <p className="text-white/70">Humidity</p>
              <p>{report.humidityPct == null ? "—" : `${Math.round(report.humidityPct)}%`}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 bg-white px-5 py-5 sm:px-7">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 font-bold",
            advice.tone === "ice" && "bg-sky-100 text-sky-950",
            advice.tone === "fire" && "bg-orange-100 text-orange-950",
            advice.tone === "forest" && "bg-emerald-100 text-emerald-950",
          )}
        >
          <p className="text-lg font-black">{advice.title}</p>
          <p className="mt-1">{advice.detail}</p>
        </div>

        {hours.length > 0 ? (
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-sky-800">
              Next hours
            </p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {hours.map((hour) => {
                const Icon = weatherIcon(hour.weatherCode);
                return (
                  <div
                    key={hour.time}
                    className="min-w-16 rounded-2xl bg-sky-50 px-2 py-3 text-center"
                  >
                    <p className="text-xs font-black text-sky-800">{formatHour(hour.time)}</p>
                    <Icon className="mx-auto mt-1 size-5 text-sky-700" />
                    <p className="mt-1 text-sm font-black text-slate-900">
                      {formatTemp(hour.temperatureC)}
                    </p>
                    <p className="text-[11px] font-bold text-sky-700">
                      {hour.snowfallCm && hour.snowfallCm > 0
                        ? `${hour.snowfallCm.toFixed(1)} cm`
                        : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div>
          <p className="text-sm font-black uppercase tracking-wide text-orange-800">
            {compact ? "Outlook" : "7-day forecast"}
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-7">
            {days.map((day) => {
              const Icon = weatherIcon(day.weatherCode);
              const snow = day.snowfallCm ?? 0;
              return (
                <div
                  key={day.date}
                  className="rounded-2xl border-2 border-orange-100 bg-gradient-to-b from-orange-50 to-white px-2 py-3 text-center"
                >
                  <p className="text-xs font-black uppercase text-orange-800">
                    {formatDay(day.date)}
                  </p>
                  <Icon className="mx-auto mt-1 size-6 text-orange-600" />
                  <p className="mt-1 text-xs font-black text-slate-900">{day.summary}</p>
                  <p className="mt-1 text-sm font-black">
                    {formatTemp(day.highC)}
                    <span className="text-slate-500"> / {formatTemp(day.lowC)}</span>
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-sky-700">
                    {snow > 0 ? `${snow.toFixed(1)} cm snow` : "No snow"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
