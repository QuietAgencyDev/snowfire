import { heatLabel, WOOD_SPECIES } from "@/lib/firewood/catalog";

export function SpeciesGuide() {
  return (
    <section className="rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
        Heat chart
      </p>
      <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
        What burns hottest
      </h2>
      <p className="mt-1 font-bold text-slate-700">
        Maple for the overnight coal bed. Birch to start. Mixed hardwood for the week.
      </p>
      <div className="mt-4 grid gap-3">
        {WOOD_SPECIES.filter((species) => species.id !== "kindling").map((species) => (
          <div
            key={species.id}
            className="grid gap-2 rounded-2xl bg-white px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <p className="font-black text-slate-950">{species.label}</p>
              <p className="font-bold text-slate-600">{species.bestFor}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {species.aroma} · spark {species.spark.toLowerCase()}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-black uppercase tracking-wide text-orange-700">
                {heatLabel(species.heat)}
              </p>
              {species.btuPerCordMillion > 0 ? (
                <p className="font-black text-slate-950">
                  ~{species.btuPerCordMillion}M BTU / cord
                </p>
              ) : null}
              <div className="mt-1 flex gap-1 sm:justify-end">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={
                      index < species.heat
                        ? "h-2 w-6 rounded-full bg-orange-500"
                        : "h-2 w-6 rounded-full bg-orange-100"
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
