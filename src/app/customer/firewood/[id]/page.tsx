import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WoodRequestForm } from "@/components/firewood/wood-request-form";
import { getSessionProfile } from "@/lib/auth/session";
import { heatLabel, woodSpeciesById } from "@/lib/firewood/catalog";
import { getActiveFirewoodProduct } from "@/lib/firewood/queries";
import { getOntarioTaxBps } from "@/lib/settings/queries";
import { formatCadFromCents } from "@/lib/money";
import { listCustomerProperties } from "@/lib/properties/queries";
import { formatPropertyAddress } from "@/lib/properties/address";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Firewood",
};

export default async function FirewoodProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getSessionProfile();
  const product = await getActiveFirewoodProduct(id);

  if (!product) {
    notFound();
  }

  const species = woodSpeciesById(product.wood_type);
  const [properties, taxBps] = await Promise.all([
    profile ? listCustomerProperties(profile.id) : Promise.resolve([]),
    getOntarioTaxBps(),
  ]);
  const primary = properties[0];

  return (
    <div className="grid gap-6">
      <Link href="/customer/firewood" className="font-black text-orange-800 underline">
        Back to the wood yard
      </Link>

      <section className="rounded-3xl bg-gradient-to-r from-orange-600 to-amber-700 px-5 py-7 text-white">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-100">
          {product.quantity_unit}
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">{product.name}</h1>
        <p className="mt-3 text-3xl font-black">{formatCadFromCents(product.price)}</p>
        <p className="mt-2 max-w-2xl text-lg font-bold text-white/90">
          {product.description}
        </p>
      </section>

      <section className="grid gap-3 rounded-3xl border-2 border-orange-200 bg-white p-5 sm:grid-cols-2">
        <p className="font-bold text-slate-800">
          <span className="font-black text-orange-800">In the yard: </span>
          {product.inventory_quantity}
        </p>
        <p className="font-bold text-slate-800">
          <span className="font-black text-orange-800">Seasoned: </span>
          {product.seasoned ? "Yes" : "Not yet"}
        </p>
        <p className="font-bold text-slate-800">
          <span className="font-black text-orange-800">Kiln-dried: </span>
          {product.kiln_dried ? "Yes" : "Air-dried"}
        </p>
        <p className="font-bold text-slate-800">
          <span className="font-black text-orange-800">How it moves: </span>
          {[product.delivery_available ? "Delivery" : null, product.pickup_available ? "Pickup" : null]
            .filter(Boolean)
            .join(" · ") || "Ask the yard"}
        </p>
        {species ? (
          <>
            <p className="font-bold text-slate-800">
              <span className="font-black text-orange-800">Heat: </span>
              {heatLabel(species.heat)}
              {species.btuPerCordMillion > 0 ? ` · ~${species.btuPerCordMillion}M BTU / cord` : ""}
            </p>
            <p className="font-bold text-slate-800">
              <span className="font-black text-orange-800">Best for: </span>
              {species.bestFor}
            </p>
          </>
        ) : null}
      </section>

      {primary ? (
        <section className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-5">
          <h2 className="text-2xl font-black text-slate-950">Lands at {primary.name}</h2>
          <p className="mt-1 font-bold text-slate-700">{formatPropertyAddress(primary)}</p>
          <p className="mt-2 font-bold text-slate-700">
            Stack: {primary.firewood_stack_location || "Add the crib location on the property file."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/customer/properties/${primary.id}/edit`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-12 border-2 border-orange-300 px-4 font-black text-orange-900",
              )}
            >
              Edit woodshed file
            </Link>
            <Link
              href={`/customer/properties/${primary.id}/wood`}
              className="inline-flex h-12 items-center font-black text-orange-800 underline"
            >
              Print delivery brief
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border-2 border-orange-200 bg-orange-50 p-5">
          <h2 className="text-2xl font-black text-slate-950">Need a drop address</h2>
          <p className="mt-1 font-bold text-slate-700">
            Add a property so the truck knows where the crib is.
          </p>
          <Link
            href="/customer/properties/new"
            className={cn(buttonVariants({ variant: "success" }), "mt-4 h-12 px-5 font-black")}
          >
            Add property
          </Link>
        </section>
      )}

      {properties.length > 0 ? (
        <WoodRequestForm product={product} properties={properties} taxBps={taxBps} />
      ) : null}
    </div>
  );
}
