import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import {
  formatPropertyAddress,
  propertyCoordinates,
} from "@/lib/properties/address";
import { getCustomerProperty, listPropertyPhotos } from "@/lib/properties/queries";
import { listPropertyZones } from "@/lib/properties/zones";
import { getOntarioTaxBps } from "@/lib/settings/queries";
import { getLocalWeatherReport } from "@/lib/weather/open-meteo";
import { winterReadiness } from "@/lib/properties/readiness";
import { treatmentCoach } from "@/lib/properties/treatment-coach";
import { iceRisk } from "@/lib/weather/ice-risk";
import { CommandCenter } from "@/components/command/command-center";
import { ClientInfoCard } from "@/components/properties/client-info-card";
import { DrivewayPhotos } from "@/components/properties/driveway-photos";
import { PhotoCompare } from "@/components/properties/photo-compare";
import { PropertyMap } from "@/components/properties/property-map";
import { RatePanel } from "@/components/pricing/rate-panel";
import { ServiceNotes } from "@/components/properties/service-notes";
import { ZoneManager } from "@/components/properties/zone-manager";
import { PropertyWeather } from "@/components/weather/property-weather";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Property",
};

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getSessionProfile();

  if (!profile) {
    notFound();
  }

  const property = await getCustomerProperty(id, profile.id);

  if (!property) {
    notFound();
  }

  const address = formatPropertyAddress(property);
  const coordinates = propertyCoordinates(property);
  const [drivewayPhotos, finishedPhotos, weather, zones, taxBps] = await Promise.all([
    listPropertyPhotos(property.id, "DRIVEWAY"),
    listPropertyPhotos(property.id, "DRIVEWAY_FINISHED"),
    coordinates
      ? getLocalWeatherReport(coordinates.latitude, coordinates.longitude)
      : Promise.resolve(null),
    listPropertyZones(property.id),
    getOntarioTaxBps(),
  ]);
  const risk = weather ? iceRisk(weather) : null;
  const readiness = winterReadiness({
    property,
    profile,
    drivewayPhotoCount: drivewayPhotos.length,
    finishedPhotoCount: finishedPhotos.length,
  });
  const tips = treatmentCoach(property.service_preferences, risk);
  const beforeUrl = drivewayPhotos[0]?.signedUrl;
  const afterUrl = finishedPhotos[0]?.signedUrl;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-3xl bg-gradient-to-r from-sky-600 via-blue-700 to-orange-500 px-5 py-6 text-white">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-4xl font-black tracking-tight">{property.name}</h1>
            <Badge className="border-white/30 bg-white/15 font-black text-white">
              {property.property_type === "COMMERCIAL" ? "Commercial" : "Residential"}
            </Badge>
          </div>
          <p className="mt-2 text-lg font-bold text-white/90">{address}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/customer/properties/${property.id}/edit`}
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "h-12 bg-white px-5 font-black text-slate-950 hover:bg-amber-100",
            )}
          >
            Edit property
          </Link>
          <Link
            href={`/customer/properties/${property.id}/wood`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-12 border-white/40 bg-white/10 px-5 font-black text-white hover:bg-white/20",
            )}
          >
            Wood brief
          </Link>
        </div>
      </div>

      <CommandCenter
        propertyName={property.name}
        readiness={readiness}
        risk={risk}
        tips={tips}
        briefHref={`/customer/properties/${property.id}/brief`}
      />

      <RatePanel property={property} taxBps={taxBps} />

      <PropertyWeather address={address} report={weather} />

      <ClientInfoCard
        profile={profile}
        returnTo={`/customer/properties/${property.id}`}
      />

      <PropertyMap
        address={address}
        latitude={coordinates?.latitude}
        longitude={coordinates?.longitude}
      />

      <DrivewayPhotos
        propertyId={property.id}
        photoType="DRIVEWAY"
        photos={drivewayPhotos}
        title="Driveway photos"
        description="Your photos of the driveway as it is now — the baseline for the crew."
      />

      <DrivewayPhotos
        propertyId={property.id}
        photoType="DRIVEWAY_FINISHED"
        photos={finishedPhotos}
        title="Finished driveway photos"
        description="After the driveway is cleared or finished. These stay on the property."
      />

      {beforeUrl && afterUrl ? (
        <PhotoCompare beforeUrl={beforeUrl} afterUrl={afterUrl} />
      ) : null}

      {property.property_type === "COMMERCIAL" ? (
        <ZoneManager propertyId={property.id} zones={zones} />
      ) : null}

      <ServiceNotes property={property} />
    </div>
  );
}
