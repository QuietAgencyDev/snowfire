import {
  googleMapsDirectionsUrl,
  googleMapsEmbedUrl,
  googleMapsExternalUrl,
  googleMapsQuery,
} from "@/lib/maps/urls";
import { getMapsApiKey } from "@/lib/env";

type PropertyMapProps = {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
};

export function PropertyMap({ address, latitude, longitude }: PropertyMapProps) {
  const query = googleMapsQuery({ address, latitude, longitude });
  const embedUrl = googleMapsEmbedUrl(query, getMapsApiKey());

  return (
    <section className="rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
        Google Map
      </p>
      <h2 className="mt-1 text-2xl font-black text-slate-950">Pinned to this driveway</h2>
      <p className="mt-1 font-bold text-sky-800">{address}</p>
      <div className="mt-4 overflow-hidden rounded-2xl border-2 border-sky-100">
        <iframe
          title={`Map of ${address}`}
          src={embedUrl}
          className="h-72 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-4 font-black text-sky-800">
        <a href={googleMapsExternalUrl(query)} target="_blank" rel="noreferrer" className="underline">
          Open in Google Maps
        </a>
        <a href={googleMapsDirectionsUrl(query)} target="_blank" rel="noreferrer" className="underline">
          Directions
        </a>
      </div>
    </section>
  );
}
