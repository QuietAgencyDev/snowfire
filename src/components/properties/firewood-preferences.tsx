import { FIREWOOD_OPTION_GROUPS } from "@/lib/firewood/options";
import { cn } from "@/lib/utils";

type FirewoodPreferencesProps = {
  selected?: string[] | null;
  stackLocation?: string | null;
  notes?: string | null;
};

export function FirewoodPreferences({
  selected = [],
  stackLocation,
  notes,
}: FirewoodPreferencesProps) {
  const chosen = new Set(selected ?? []);

  return (
    <section className="grid gap-4 rounded-3xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 p-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
          Firewood
        </p>
        <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
          Where the wood lives
        </h3>
        <p className="mt-1 font-bold text-slate-700">
          The yard uses this file so a truck can land a cord without guessing. Checkout is next — this is not an order.
        </p>
      </div>
      {FIREWOOD_OPTION_GROUPS.map((group) => (
        <div key={group.id}>
          <p className="text-sm font-black uppercase tracking-wide text-orange-900">
            {group.title}
          </p>
          <p className="mt-1 font-bold text-slate-700">{group.blurb}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {group.options.map((option) => (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-white bg-white/80 p-3 font-bold shadow-sm",
                  "has-[:checked]:border-orange-500 has-[:checked]:bg-orange-100",
                )}
              >
                <input
                  type="checkbox"
                  name="firewoodPreference"
                  value={option.id}
                  defaultChecked={chosen.has(option.id)}
                  className="mt-1 size-5 accent-orange-600"
                />
                <span>
                  <span className="block text-base font-black text-slate-950">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold text-slate-600">
                    {option.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="grid gap-2">
        <label htmlFor="firewoodStackLocation" className="font-black">
          Stack location
        </label>
        <input
          id="firewoodStackLocation"
          name="firewoodStackLocation"
          defaultValue={stackLocation ?? ""}
          placeholder="Left of the garage, on the crib — not against the siding"
          className="h-12 rounded-lg border-2 border-orange-100 bg-white px-3 font-semibold"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="firewoodNotes" className="font-black">
          Wood notes
        </label>
        <textarea
          id="firewoodNotes"
          name="firewoodNotes"
          defaultValue={notes ?? ""}
          placeholder="Soft lawn, low wires, dog run, do not block the side door"
          className="min-h-24 rounded-lg border-2 border-orange-100 bg-white px-3 py-2 font-semibold"
        />
      </div>
    </section>
  );
}
