import { SERVICE_OPTION_GROUPS } from "@/lib/properties/service-options";
import { cn } from "@/lib/utils";

const toneClass = {
  ice: "border-sky-200 from-sky-50 to-white",
  fire: "border-orange-200 from-orange-50 to-white",
  forest: "border-emerald-200 from-emerald-50 to-white",
  gold: "border-amber-200 from-amber-50 to-white",
};

const checkedClass = {
  ice: "has-[:checked]:border-sky-500 has-[:checked]:bg-sky-100",
  fire: "has-[:checked]:border-orange-500 has-[:checked]:bg-orange-100",
  forest: "has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-100",
  gold: "has-[:checked]:border-amber-500 has-[:checked]:bg-amber-100",
};

type ServicePreferencesProps = {
  selected?: string[] | null;
};

export function ServicePreferences({ selected = [] }: ServicePreferencesProps) {
  const chosen = new Set(selected ?? []);

  return (
    <div className="grid gap-5">
      {SERVICE_OPTION_GROUPS.map((group) => (
        <section
          key={group.id}
          className={cn(
            "rounded-3xl border-2 bg-gradient-to-br p-5",
            toneClass[group.tone],
          )}
        >
          <h3 className="text-xl font-black tracking-tight text-slate-950">{group.title}</h3>
          <p className="mt-1 font-bold text-slate-700">{group.blurb}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {group.options.map((option) => (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-white bg-white/80 p-3 font-bold shadow-sm transition-colors",
                  checkedClass[group.tone],
                )}
              >
                <input
                  type="checkbox"
                  name="servicePreference"
                  value={option.id}
                  defaultChecked={chosen.has(option.id)}
                  className="mt-1 size-5 accent-sky-600"
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
        </section>
      ))}
    </div>
  );
}
