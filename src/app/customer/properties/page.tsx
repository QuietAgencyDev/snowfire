import type { Metadata } from "next";
import Link from "next/link";
import { getSessionProfile } from "@/lib/auth/session";
import { formatPropertyAddress } from "@/lib/properties/address";
import { listCustomerProperties } from "@/lib/properties/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Properties",
};

export default async function PropertiesPage() {
  const profile = await getSessionProfile();

  if (!profile) {
    return null;
  }

  const properties = await listCustomerProperties(profile.id);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-3xl bg-gradient-to-r from-sky-600 to-emerald-600 px-5 py-6 text-white">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Your properties</h1>
          <p className="mt-2 max-w-2xl text-lg font-bold text-white/90">
            One address. Map, driveway photos, treatment checkboxes, and the
            weather for that pin.
          </p>
        </div>
        <Link
          href="/customer/properties/new"
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "h-12 bg-white px-5 font-black text-slate-950 hover:bg-amber-100",
          )}
        >
          Add property
        </Link>
      </div>

      {properties.length === 0 ? (
        <section className="rounded-3xl border-2 border-dashed border-sky-300 bg-sky-50 p-6">
          <h2 className="text-2xl font-black text-sky-950">No properties yet</h2>
          <p className="mt-2 font-bold text-sky-800">
            Add the driveway you want serviced. Nothing here is simulated.
          </p>
        </section>
      ) : (
        <div className="grid gap-4">
          {properties.map((property) => (
            <Link key={property.id} href={`/customer/properties/${property.id}`}>
              <article className="rounded-3xl border-2 border-orange-100 bg-gradient-to-r from-white to-orange-50 p-5 transition-transform hover:-translate-y-0.5">
                <h2 className="text-2xl font-black text-slate-950">{property.name}</h2>
                <p className="mt-1 font-bold text-sky-800">
                  {formatPropertyAddress(property)}
                </p>
                <p className="mt-2 font-black text-orange-700">
                  {property.property_type === "COMMERCIAL" ? "Commercial" : "Residential"}
                  {property.driveway_type ? ` · ${property.driveway_type}` : ""}
                </p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
