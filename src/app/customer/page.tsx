import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { CommandCenter } from "@/components/command/command-center";
import { listCustomerRequests } from "@/lib/bookings/queries";
import { requestStatusLabel } from "@/lib/bookings/labels";
import { StatusPill } from "@/components/bookings/status-pill";
import { WoodCommand } from "@/components/firewood/wood-command";
import { getSessionProfile } from "@/lib/auth/session";
import { listActiveFirewoodProducts, listActiveServices } from "@/lib/firewood/queries";
import { woodReadiness } from "@/lib/firewood/readiness";
import {
  formatPropertyAddress,
  propertyCoordinates,
} from "@/lib/properties/address";
import { winterReadiness } from "@/lib/properties/readiness";
import { listCustomerProperties, listPropertyPhotos } from "@/lib/properties/queries";
import { treatmentCoach } from "@/lib/properties/treatment-coach";
import { iceRisk } from "@/lib/weather/ice-risk";
import { getLocalWeatherReport } from "@/lib/weather/open-meteo";
import { PropertyWeather } from "@/components/weather/property-weather";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Customer",
};

export default async function CustomerDashboardPage() {
  const profile = await getSessionProfile();
  const name = profile?.first_name || "there";
  const properties = profile ? await listCustomerProperties(profile.id) : [];
  const [products, services, requests] = await Promise.all([
    listActiveFirewoodProducts(),
    listActiveServices(),
    profile ? listCustomerRequests(profile.id) : Promise.resolve([]),
  ]);
  const primary = properties[0];
  const woodScore = primary ? woodReadiness(primary) : null;
  const roofService = services.find((service) => service.service_type === "ROOF_SALT_PUCKS");
  const coordinates = primary ? propertyCoordinates(primary) : null;
  const [drivewayPhotos, finishedPhotos] = primary
    ? await Promise.all([
        listPropertyPhotos(primary.id, "DRIVEWAY"),
        listPropertyPhotos(primary.id, "DRIVEWAY_FINISHED"),
      ])
    : [[], []];
  const weather =
    coordinates && primary
      ? await getLocalWeatherReport(coordinates.latitude, coordinates.longitude)
      : null;
  const risk = weather ? iceRisk(weather) : null;
  const readiness =
    primary && profile
      ? winterReadiness({
          property: primary,
          profile,
          drivewayPhotoCount: drivewayPhotos.length,
          finishedPhotoCount: finishedPhotos.length,
        })
      : null;
  const tips = primary ? treatmentCoach(primary.service_preferences, risk) : [];

  return (
    <div className="grid gap-6">
      <section className="flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-gradient-to-r from-sky-600 via-blue-700 to-orange-500 px-5 py-7 text-white">
        <div className="min-w-64 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200">
            SnowFire.ca
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Hey {name} — this is a winter command center.
          </h1>
          <p className="mt-3 max-w-2xl text-lg font-bold text-white/90">
            Snow, roof salt pucks, and a live wood yard on the real address.
            Request a visit or a cord. We still will not invent jobs or charges.
          </p>
        </div>
        <BrandLogo
          variant="mascot"
          size="sm"
          className="hidden h-36 w-auto shrink-0 sm:block"
          priority
        />
      </section>

      {primary && readiness ? (
        <CommandCenter
          propertyName={primary.name}
          readiness={readiness}
          risk={risk}
          tips={tips}
          briefHref={`/customer/properties/${primary.id}/brief`}
        />
      ) : null}

      {primary ? (
        <PropertyWeather
          address={formatPropertyAddress(primary)}
          report={weather}
        />
      ) : (
        <PropertyWeather address="" report={null} />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5">
          <h2 className="text-2xl font-black text-slate-950">Properties</h2>
          <p className="mt-1 font-bold text-slate-700">
            {properties.length === 0
              ? "Add a driveway to unlock the command center."
              : `${properties.length} ${properties.length === 1 ? "property" : "properties"} on this account.`}
          </p>
          <div className="mt-4 grid gap-3">
            {properties.slice(0, 3).map((property) => (
              <Link
                key={property.id}
                href={`/customer/properties/${property.id}`}
                className="rounded-2xl border-2 border-sky-100 bg-white px-4 py-3 hover:border-sky-400"
              >
                <span className="block font-black text-slate-950">{property.name}</span>
                <span className="mt-1 block font-bold text-sky-800">
                  {formatPropertyAddress(property)}
                </span>
              </Link>
            ))}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/customer/properties"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-12 border-2 border-sky-300 px-4 font-black text-sky-900",
                )}
              >
                View properties
              </Link>
              <Link
                href="/customer/properties/new"
                className={cn(
                  buttonVariants({ variant: "success" }),
                  "h-12 px-4 font-black",
                )}
              >
                Add property
              </Link>
            </div>
          </div>
        </section>
        {primary && woodScore ? (
          <WoodCommand
            propertyName={primary.name}
            readiness={woodScore}
            editHref={`/customer/properties/${primary.id}/edit`}
            briefHref={`/customer/properties/${primary.id}/wood`}
          />
        ) : (
          <section className="rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
              Firewood
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">The wood yard is live</h2>
            <p className="mt-1 font-bold text-slate-700">
              {products.length} products on the list. Add a property so the truck knows the crib.
            </p>
            <Link
              href="/customer/firewood"
              className={cn(
                buttonVariants({ variant: "success" }),
                "mt-4 h-12 bg-orange-600 px-4 font-black hover:bg-orange-700",
              )}
            >
              Open the wood yard
            </Link>
          </section>
        )}
      </div>

      {roofService ? (
        <section className="rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">
            New service
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">{roofService.name}</h2>
          <p className="mt-1 font-bold text-slate-700">{roofService.description}</p>
          <p className="mt-3 font-bold text-slate-700">
            Tick salt pucks on a property. Ice-dam watch uses the forecast on that pin.
          </p>
          <Link
            href={primary ? `/customer/properties/${primary.id}/edit` : "/customer/properties/new"}
            className="mt-4 inline-flex h-12 items-center font-black text-amber-900 underline"
          >
            Add pucks to a roof
          </Link>
        </section>
      ) : null}

      <section className="rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
          Next step
        </p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">Request a snow visit</h2>
        <p className="mt-1 font-bold text-slate-700">
          Pick the property, the service, and a date. Operations reviews it.
          No crew is dispatched and no card is charged.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/customer/book"
            className={cn(buttonVariants({ variant: "success" }), "h-12 px-5 font-black")}
          >
            Book snow
          </Link>
          <Link href="/customer/requests" className="inline-flex h-12 items-center font-black text-sky-800 underline">
            {requests.length === 0
              ? "No requests yet"
              : `${requests.length} ${requests.length === 1 ? "request" : "requests"}`}
          </Link>
        </div>
        {requests[0] ? (
          <p className="mt-4 font-bold text-slate-700">
            Latest: {requests[0].service_name} · {requests[0].requested_date}{" "}
            <StatusPill label={requestStatusLabel(requests[0].status)} tone="ice" />
          </p>
        ) : null}
      </section>
    </div>
  );
}
