import {
  asFirewoodPreferenceList,
  FIREWOOD_OPTION_GROUPS,
  firewoodPreferenceLabel,
} from "@/lib/firewood/options";
import {
  asPreferenceList,
  SERVICE_OPTION_GROUPS,
  servicePreferenceLabel,
} from "@/lib/properties/service-options";
import type { Property } from "@/types/database";

type ServiceNotesProps = {
  property: Property;
};

export function ServiceNotes({ property }: ServiceNotesProps) {
  const selected = new Set(asPreferenceList(property.service_preferences));
  const wood = new Set(asFirewoodPreferenceList(property.firewood_preferences));

  return (
    <section className="grid gap-4 rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
          Crew card
        </p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
          How this property gets serviced
        </h2>
      </div>
      <div className="grid gap-2 font-bold text-slate-800 sm:grid-cols-2">
        <p>
          <span className="font-black text-emerald-800">Surface: </span>
          {property.driveway_type || "Not set"}
        </p>
        <p>
          <span className="font-black text-emerald-800">Size: </span>
          {property.driveway_length || property.driveway_width
            ? `${property.driveway_length ?? "—"} m × ${property.driveway_width ?? "—"} m`
            : "Not set"}
        </p>
        <p>
          <span className="font-black text-emerald-800">Walkways / steps: </span>
          {property.walkway_count} / {property.steps_count}
        </p>
        <p>
          <span className="font-black text-emerald-800">Snow storage: </span>
          {property.snow_storage_location || "Not set"}
        </p>
        <p>
          <span className="font-black text-emerald-800">De-icing: </span>
          {property.deicing_required ? "Required" : "Not required"}
        </p>
        <p>
          <span className="font-black text-emerald-800">Roof: </span>
          {property.roof_type || "Not set"}
          {property.salt_puck_count > 0 ? ` · ${property.salt_puck_count} pucks` : ""}
        </p>
        <p>
          <span className="font-black text-emerald-800">Wood stack: </span>
          {property.firewood_stack_location || "Not set"}
        </p>
        <p>
          <span className="font-black text-emerald-800">Hazards: </span>
          {property.hazards || "None noted"}
        </p>
      </div>
      <p className="font-bold text-slate-800">
        <span className="font-black text-emerald-800">Instructions: </span>
        {property.special_instructions || "None noted"}
      </p>
      {property.roof_notes ? (
        <p className="font-bold text-slate-800">
          <span className="font-black text-amber-800">Roof notes: </span>
          {property.roof_notes}
        </p>
      ) : null}
      {property.firewood_notes ? (
        <p className="font-bold text-slate-800">
          <span className="font-black text-orange-800">Wood notes: </span>
          {property.firewood_notes}
        </p>
      ) : null}
      <div className="grid gap-4">
        {SERVICE_OPTION_GROUPS.map((group) => {
          const picks = group.options.filter((option) => selected.has(option.id));
          return (
            <div key={group.id}>
              <p className="text-sm font-black uppercase tracking-wide text-slate-700">
                {group.title}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {picks.length === 0 ? (
                  <span className="rounded-full bg-white px-3 py-1 font-bold text-slate-500">
                    Nothing checked yet
                  </span>
                ) : (
                  picks.map((option) => (
                    <span
                      key={option.id}
                      className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-black text-white"
                    >
                      {servicePreferenceLabel(option.id)}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
        {FIREWOOD_OPTION_GROUPS.map((group) => {
          const picks = group.options.filter((option) => wood.has(option.id));
          return (
            <div key={group.id}>
              <p className="text-sm font-black uppercase tracking-wide text-slate-700">
                {group.title}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {picks.length === 0 ? (
                  <span className="rounded-full bg-white px-3 py-1 font-bold text-slate-500">
                    Nothing checked yet
                  </span>
                ) : (
                  picks.map((option) => (
                    <span
                      key={option.id}
                      className="rounded-full bg-orange-600 px-3 py-1 text-sm font-black text-white"
                    >
                      {firewoodPreferenceLabel(option.id)}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
