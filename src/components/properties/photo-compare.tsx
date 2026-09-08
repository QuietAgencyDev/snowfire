"use client";

import { useState } from "react";

type PhotoCompareProps = {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  detail?: string;
};

export function PhotoCompare({
  beforeUrl,
  afterUrl,
  beforeLabel = "Client driveway",
  afterLabel = "Finished",
  detail = `${beforeLabel} on the left. ${afterLabel} on the right. This is your file, not a fake job.`,
}: PhotoCompareProps) {
  const [percent, setPercent] = useState(52);

  return (
    <section className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">
        Proof compare
      </p>
      <h2 className="mt-1 text-2xl font-black text-slate-950">
        Slide to see the driveway change
      </h2>
      <p className="mt-1 font-bold text-slate-700">
        {detail}
      </p>
      <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-2xl bg-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={afterUrl} alt={afterLabel} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${percent}%` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={beforeUrl} alt={beforeLabel} className="absolute inset-0 size-full object-cover" />
        </div>
        <div
          className="absolute inset-y-0 w-1 bg-white shadow-lg"
          style={{ left: `${percent}%` }}
        />
      </div>
      <label className="mt-4 grid gap-2 font-black text-violet-900">
        Drag the proof slider
        <input
          type="range"
          min="4"
          max="96"
          value={percent}
          onChange={(event) => setPercent(Number(event.target.value))}
          className="w-full accent-violet-600"
        />
      </label>
    </section>
  );
}
