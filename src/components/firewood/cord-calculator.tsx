"use client";

import { useMemo, useState } from "react";
import { estimateCords, type WoodHeatUse } from "@/lib/firewood/cords";

const USES: { id: WoodHeatUse; label: string }[] = [
  { id: "ambiance", label: "Weekend fires" },
  { id: "backup", label: "Backup heat" },
  { id: "primary", label: "Primary heat" },
];

export function CordCalculator() {
  const [sqft, setSqft] = useState("1800");
  const [use, setUse] = useState<WoodHeatUse>("backup");
  const estimate = useMemo(
    () => estimateCords({ heatedSqFt: Number(sqft) || 0, use }),
    [sqft, use],
  );

  return (
    <section className="rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">
        Cord calculator
      </p>
      <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
        Size the woodshed
      </h2>
      <p className="mt-1 font-bold text-slate-700">
        Ontario rule of thumb from heated square footage. This is a yard estimate — not a quote and not an order.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 font-black">
          Heated square feet
          <input
            type="number"
            min="0"
            step="50"
            value={sqft}
            onChange={(event) => setSqft(event.target.value)}
            className="h-12 rounded-lg border-2 border-amber-100 bg-white px-3 font-semibold"
          />
        </label>
        <label className="grid gap-2 font-black">
          How you burn
          <select
            value={use}
            onChange={(event) => setUse(event.target.value as WoodHeatUse)}
            className="h-12 rounded-lg border-2 border-amber-100 bg-white px-2.5 text-sm font-bold"
          >
            {USES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-orange-600 px-4 py-4 text-white">
          <p className="text-xs font-black uppercase tracking-wide text-orange-100">
            Face cords
          </p>
          <p className="mt-1 text-5xl font-black">{estimate.faceCords}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-4 py-4 text-white">
          <p className="text-xs font-black uppercase tracking-wide text-amber-200">
            Full cords
          </p>
          <p className="mt-1 text-5xl font-black">{estimate.fullCords}</p>
        </div>
      </div>
      <p className="mt-3 font-black text-slate-950">{estimate.headline}</p>
      <p className="mt-1 font-bold text-slate-700">{estimate.detail}</p>
    </section>
  );
}
