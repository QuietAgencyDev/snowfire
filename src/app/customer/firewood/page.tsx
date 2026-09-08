import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon } from "@/components/brand/coming-soon";
import { CordCalculator } from "@/components/firewood/cord-calculator";
import { ProductCard } from "@/components/firewood/product-card";
import { SpeciesGuide } from "@/components/firewood/species-guide";
import { WoodCommand } from "@/components/firewood/wood-command";
import { getSessionProfile } from "@/lib/auth/session";
import { woodReadiness } from "@/lib/firewood/readiness";
import { listActiveFirewoodProducts } from "@/lib/firewood/queries";
import { listCustomerProperties } from "@/lib/properties/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Firewood",
};

export default async function FirewoodYardPage() {
  const profile = await getSessionProfile();
  const [products, properties] = await Promise.all([
    listActiveFirewoodProducts(),
    profile ? listCustomerProperties(profile.id) : Promise.resolve([]),
  ]);
  const primary = properties[0];
  const readiness = primary ? woodReadiness(primary) : null;

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-rose-700 px-5 py-7 text-white">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-100">
          SnowFire.ca · Fire
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          The wood yard is open.
        </h1>
        <p className="mt-3 max-w-2xl text-lg font-bold text-white/90">
          Real species, real list prices, and a delivery file on the property.
          Checkout is next. We will not invent a paid order.
        </p>
      </section>

      {primary && readiness ? (
        <WoodCommand
          propertyName={primary.name}
          readiness={readiness}
          editHref={`/customer/properties/${primary.id}/edit`}
          briefHref={`/customer/properties/${primary.id}/wood`}
        />
      ) : (
        <section className="rounded-3xl border-2 border-orange-200 bg-orange-50 p-5">
          <h2 className="text-2xl font-black text-slate-950">Add a delivery address</h2>
          <p className="mt-1 font-bold text-slate-700">
            The truck lands wood on a property — not a generic city drop.
          </p>
          <Link
            href="/customer/properties/new"
            className={cn(buttonVariants({ variant: "success" }), "mt-4 h-12 px-5 font-black")}
          >
            Add property
          </Link>
        </section>
      )}

      <CordCalculator />
      <SpeciesGuide />

      <section className="grid gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
            Yard list
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">What is in the crib</h2>
          <p className="mt-1 font-bold text-slate-700">
            Prices are the yard list in CAD. Inventory is live. Payment is not live yet.
          </p>
        </div>
        {products.length === 0 ? (
          <p className="font-bold text-slate-600">
            The crib is empty in this environment. Seed firewood products to show the yard.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <ComingSoon
        title="Pay for a cord"
        description="You can request a load now. The yard can accept it and hold inventory. Charging a card waits for Stripe."
      />
    </div>
  );
}
