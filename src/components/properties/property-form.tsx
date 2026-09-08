"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createPropertyAction,
  updatePropertyAction,
  type PropertyFormState,
} from "@/lib/properties/actions";
import { CANADIAN_PROVINCES } from "@/lib/properties/provinces";
import { previewPropertyWeatherAction } from "@/lib/weather/actions";
import type { Property } from "@/types/database";
import { FirewoodPreferences } from "@/components/properties/firewood-preferences";
import { ServicePreferences } from "@/components/properties/service-preferences";
import { PropertyWeather } from "@/components/weather/property-weather";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: PropertyFormState = {};

const fieldClass = "h-12 border-2 border-sky-100 bg-white font-semibold";

type PropertyFormProps = {
  property?: Property;
};

export function PropertyForm({ property }: PropertyFormProps) {
  const action = property ? updatePropertyAction : createPropertyAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [weather, weatherAction, weatherPending] = useActionState(
    previewPropertyWeatherAction,
    {},
  );
  const saved = weather.fields;

  return (
    <form action={formAction} className="grid gap-6">
      {property ? <input type="hidden" name="propertyId" value={property.id} /> : null}

      <section className="grid gap-4 rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
            Your place
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            Address unlocks the weather
          </h2>
          <p className="mt-1 font-bold text-slate-700">
            Type the driveway address. We pin it, then pull the forecast for that exact spot.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name" className="font-black">
            Property name
          </Label>
          <Input
            id="name"
            name="name"
            required
            key={saved?.name ?? "name"}
            defaultValue={saved?.name ?? property?.name}
            placeholder="Home, Shop, Cottage"
            className={fieldClass}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="propertyType" className="font-black">
            Type
          </Label>
          <select
            id="propertyType"
            name="propertyType"
            defaultValue={saved?.propertyType ?? property?.property_type ?? "RESIDENTIAL"}
            className="h-12 w-full rounded-lg border-2 border-sky-100 bg-white px-2.5 text-sm font-bold"
          >
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="addressLine1" className="font-black">
            Street address
          </Label>
          <Input
            id="addressLine1"
            name="addressLine1"
            required
            autoComplete="street-address"
            key={saved?.addressLine1 ?? "street"}
            defaultValue={saved?.addressLine1 ?? property?.address_line_1}
            className={fieldClass}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="addressLine2" className="font-black">
            Unit or line 2
          </Label>
          <Input
            id="addressLine2"
            name="addressLine2"
            defaultValue={saved?.addressLine2 ?? property?.address_line_2 ?? ""}
            className={fieldClass}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="city" className="font-black">
              City
            </Label>
            <Input
              id="city"
              name="city"
              required
              autoComplete="address-level2"
              key={saved?.city ?? "city"}
              defaultValue={saved?.city ?? property?.city}
              className={fieldClass}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="province" className="font-black">
              Province
            </Label>
            <select
              id="province"
              name="province"
              defaultValue={saved?.province ?? property?.province ?? "ON"}
              className="h-12 w-full rounded-lg border-2 border-sky-100 bg-white px-2.5 text-sm font-bold"
            >
              {CANADIAN_PROVINCES.map((province) => (
                <option key={province.value} value={province.value}>
                  {province.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="postalCode" className="font-black">
              Postal code
            </Label>
            <Input
              id="postalCode"
              name="postalCode"
              required
              autoComplete="postal-code"
              key={saved?.postalCode ?? "postal"}
              defaultValue={saved?.postalCode ?? property?.postal_code}
              className={fieldClass}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            formAction={weatherAction}
            disabled={weatherPending}
            className="h-12 bg-sky-600 px-5 font-black text-white hover:bg-sky-700"
          >
            {weatherPending ? "Pinning the address…" : "See my local weather"}
          </Button>
          <p className="font-bold text-sky-800">
            We use this pin for snow, wind, and the 7-day outlook.
          </p>
        </div>
        {weather.error ? (
          <Alert variant="destructive">
            <AlertTitle className="font-black">Weather needs a clearer address</AlertTitle>
            <AlertDescription className="font-semibold">{weather.error}</AlertDescription>
          </Alert>
        ) : null}
        {weather.report ? (
          <PropertyWeather address={weather.address ?? ""} report={weather.report} compact />
        ) : null}
      </section>

      <section className="grid gap-4 rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
            Driveway
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            How this driveway works
          </h2>
          <p className="mt-1 font-bold text-slate-700">
            These notes stay on the property for every future job.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="drivewayType" className="font-black">
              Surface
            </Label>
            <select
              id="drivewayType"
              name="drivewayType"
              defaultValue={property?.driveway_type ?? ""}
              className="h-12 w-full rounded-lg border-2 border-orange-100 bg-white px-2.5 text-sm font-bold"
            >
              <option value="">Choose one</option>
              <option value="Asphalt">Asphalt</option>
              <option value="Concrete">Concrete</option>
              <option value="Gravel">Gravel</option>
              <option value="Interlock">Interlock</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parkingArea" className="font-black">
              Parking area
            </Label>
            <Input
              id="parkingArea"
              name="parkingArea"
              defaultValue={property?.parking_area ?? ""}
              placeholder="Single, double, lot"
              className="h-12 border-2 border-orange-100 bg-white font-semibold"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="drivewayLength" className="font-black">
              Length (m)
            </Label>
            <Input
              id="drivewayLength"
              name="drivewayLength"
              type="number"
              min="0"
              step="0.1"
              defaultValue={property?.driveway_length ?? ""}
              className="h-12 border-2 border-orange-100 bg-white font-semibold"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="drivewayWidth" className="font-black">
              Width (m)
            </Label>
            <Input
              id="drivewayWidth"
              name="drivewayWidth"
              type="number"
              min="0"
              step="0.1"
              defaultValue={property?.driveway_width ?? ""}
              className="h-12 border-2 border-orange-100 bg-white font-semibold"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="walkwayCount" className="font-black">
              Walkways
            </Label>
            <Input
              id="walkwayCount"
              name="walkwayCount"
              type="number"
              min="0"
              step="1"
              defaultValue={property?.walkway_count ?? 0}
              className="h-12 border-2 border-orange-100 bg-white font-semibold"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stepsCount" className="font-black">
              Steps
            </Label>
            <Input
              id="stepsCount"
              name="stepsCount"
              type="number"
              min="0"
              step="1"
              defaultValue={property?.steps_count ?? 0}
              className="h-12 border-2 border-orange-100 bg-white font-semibold"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="snowStorageLocation" className="font-black">
            Snow storage
          </Label>
          <Input
            id="snowStorageLocation"
            name="snowStorageLocation"
            defaultValue={property?.snow_storage_location ?? ""}
            placeholder="Left lawn, back corner, do not block sidewalk"
            className="h-12 border-2 border-orange-100 bg-white font-semibold"
          />
        </div>
        <label className="flex items-center gap-2 font-black text-slate-900">
          <input
            type="checkbox"
            name="deicingRequired"
            defaultChecked={property?.deicing_required ?? false}
            className="size-5 accent-orange-600"
          />
          De-icing is a must on this property
        </label>
        <div className="grid gap-4 rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">
              Roof salt pucks
            </p>
            <p className="font-bold text-slate-700">
              Ice dams start at the eaves. Tell the crew the roof type and how many pucks to place.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="roofType" className="font-black">
              Roof type
            </Label>
            <select
              id="roofType"
              name="roofType"
              defaultValue={property?.roof_type ?? ""}
              className="h-12 w-full rounded-lg border-2 border-amber-100 bg-white px-2.5 text-sm font-bold"
            >
              <option value="">Choose one</option>
              <option value="Asphalt shingle">Asphalt shingle</option>
              <option value="Metal">Metal</option>
              <option value="Cedar">Cedar</option>
              <option value="Slate">Slate</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="saltPuckCount" className="font-black">
              Salt pucks
            </Label>
            <Input
              id="saltPuckCount"
              name="saltPuckCount"
              type="number"
              min="0"
              step="1"
              defaultValue={property?.salt_puck_count ?? 0}
              className="h-12 border-2 border-amber-100 bg-white font-semibold"
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="roofNotes" className="font-black">
              Roof notes
            </Label>
            <Textarea
              id="roofNotes"
              name="roofNotes"
              defaultValue={property?.roof_notes ?? ""}
              placeholder="North eaves ice-dam. Keep pucks off the skylight. Two-storey front."
              className="border-2 border-amber-100 font-semibold"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="hazards" className="font-black">
            Hazards
          </Label>
          <Textarea
            id="hazards"
            name="hazards"
            defaultValue={property?.hazards ?? ""}
            placeholder="Low wires, hidden curb, dogs, steep grade"
            className="border-2 border-orange-100 font-semibold"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="specialInstructions" className="font-black">
            Special instructions
          </Label>
          <Textarea
            id="specialInstructions"
            name="specialInstructions"
            defaultValue={property?.special_instructions ?? ""}
            placeholder="Gate code, where to stack snow, quiet hours"
            className="border-2 border-orange-100 font-semibold"
          />
        </div>
      </section>

      <ServicePreferences selected={property?.service_preferences} />

      <FirewoodPreferences
        selected={property?.firewood_preferences}
        stackLocation={property?.firewood_stack_location}
        notes={property?.firewood_notes}
      />

      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle className="font-black">Unable to save</AlertTitle>
          <AlertDescription className="font-semibold">{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={pending}
          className="h-13 h-12 bg-emerald-600 px-6 font-black text-white hover:bg-emerald-700"
        >
          {pending ? "Saving…" : property ? "Save this property" : "Save my property"}
        </Button>
        <Link
          href={property ? `/customer/properties/${property.id}` : "/customer/properties"}
          className="inline-flex h-12 items-center px-3 font-bold text-slate-600 underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
