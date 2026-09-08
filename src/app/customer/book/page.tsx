import type { Metadata } from "next";
import Link from "next/link";
import { BookingForm } from "@/components/bookings/booking-form";
import { getSessionProfile } from "@/lib/auth/session";
import { listSnowServices } from "@/lib/bookings/queries";
import { listCustomerProperties } from "@/lib/properties/queries";
import { getOntarioTaxBps } from "@/lib/settings/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Book",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; property?: string }>;
}) {
  const profile = await getSessionProfile();
  const params = await searchParams;
  const [properties, services, taxBps] = await Promise.all([
    profile ? listCustomerProperties(profile.id) : Promise.resolve([]),
    listSnowServices(),
    getOntarioTaxBps(),
  ]);

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl bg-gradient-to-r from-sky-600 to-blue-800 px-5 py-7 text-white">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-100">
          Request a visit
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Book snow or roof pucks</h1>
        <p className="mt-3 max-w-2xl text-lg font-bold text-white/90">
          Pick the property, the service, and a date. Operations reviews it.
          This does not dispatch a crew and it does not charge a card.
        </p>
      </section>

      {properties.length === 0 ? (
        <section className="rounded-3xl border-2 border-sky-200 bg-sky-50 p-5">
          <h2 className="text-2xl font-black text-slate-950">Add a property first</h2>
          <p className="mt-1 font-bold text-slate-700">
            A visit lands on a driveway — not a generic city pin.
          </p>
          <Link
            href="/customer/properties/new"
            className={cn(buttonVariants({ variant: "success" }), "mt-4 h-12 px-5 font-black")}
          >
            Add property
          </Link>
        </section>
      ) : services.length === 0 ? (
        <p className="font-bold text-slate-700">No snow services are in the catalog yet.</p>
      ) : (
        <BookingForm
          properties={properties}
          services={services}
          taxBps={taxBps}
          defaultPropertyId={params.property}
          defaultServiceId={params.service}
        />
      )}
    </div>
  );
}
