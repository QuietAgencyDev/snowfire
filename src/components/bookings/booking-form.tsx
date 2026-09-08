"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createBookingRequestAction, type BookingFormState } from "@/lib/bookings/actions";
import { PREFERRED_TIMES } from "@/lib/bookings/labels";
import { quoteSnowService, todayInTimeZone } from "@/lib/pricing/quote-math";
import { quoteSnowRateForProperty } from "@/lib/pricing/rate-card";
import { applyTaxBps, formatCadFromCents } from "@/lib/money";
import type { Property, ServiceCatalogItem } from "@/types/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPropertyAddress } from "@/lib/properties/address";

const initialState: BookingFormState = {};

type BookingFormProps = {
  properties: Property[];
  services: ServiceCatalogItem[];
  taxBps: number;
  defaultPropertyId?: string;
  defaultServiceId?: string;
};

export function BookingForm({
  properties,
  services,
  taxBps,
  defaultPropertyId,
  defaultServiceId,
}: BookingFormProps) {
  const [state, formAction, pending] = useActionState(createBookingRequestAction, initialState);
  const today = todayInTimeZone("America/Toronto");
  const [propertyId, setPropertyId] = useState(defaultPropertyId ?? properties[0]?.id ?? "");
  const [serviceId, setServiceId] = useState(defaultServiceId ?? services[0]?.id ?? "");
  const property = properties.find((item) => item.id === propertyId) ?? properties[0];
  const sizing = property ? quoteSnowRateForProperty("SEASONAL", property) : null;
  const selected = services.find((item) => item.id === serviceId);
  const seasonal = selected?.service_type === "SEASONAL";

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="propertyId" className="font-black">
          Property
        </Label>
        <select
          id="propertyId"
          name="propertyId"
          required
          value={propertyId}
          onChange={(event) => setPropertyId(event.target.value)}
          className="h-12 rounded-lg border-2 border-sky-100 bg-white px-2.5 text-sm font-bold"
        >
          {properties.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} — {formatPropertyAddress(item)}
            </option>
          ))}
        </select>
        {sizing ? (
          <p className="font-bold text-slate-600">
            {sizing.marketLabel} rate card · {sizing.drivewayClassLabel} driveway · crew rolls at{" "}
            {sizing.triggerCm} cm
            {sizing.measured ? null : (
              <>
                {" · "}
                <Link
                  href={`/customer/properties/${property?.id}/edit`}
                  className="font-black text-sky-800 underline"
                >
                  add driveway size to refine
                </Link>
              </>
            )}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3">
        <p className="font-black">Service</p>
        {services.map((service) => {
          const rate = property
            ? quoteSnowRateForProperty(service.service_type, property)
            : null;
          const quote = quoteSnowService({
            basePrice: service.base_price,
            pricingModel: service.pricing_model,
          });
          return (
            <label
              key={service.id}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-sky-100 bg-white p-4 has-[:checked]:border-sky-600 has-[:checked]:bg-sky-50"
            >
              <input
                type="radio"
                name="serviceId"
                value={service.id}
                required
                checked={serviceId === service.id}
                onChange={() => setServiceId(service.id)}
                className="mt-1 size-5 accent-sky-600"
              />
              <span>
                <span className="block font-black text-slate-950">{service.name}</span>
                <span className="mt-1 block font-bold text-slate-700">{service.description}</span>
                {rate ? (
                  <>
                    <span className="mt-2 block text-xl font-black text-slate-950">
                      {formatCadFromCents(rate.amountCents)}{" "}
                      <span className="text-base text-slate-600">{rate.unitLabel}</span>
                    </span>
                    <span className="block font-bold text-slate-600">
                      {formatCadFromCents(
                        rate.amountCents + applyTaxBps(rate.amountCents, taxBps),
                      )}{" "}
                      with HST
                      {rate.unit === "SEASON" ? ` · ${rate.season}` : null}
                    </span>
                  </>
                ) : (
                  <span className="mt-2 block font-black text-sky-800">
                    {quote.custom ? quote.label : formatCadFromCents(quote.amountCents)}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {seasonal ? (
        <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
          <input type="hidden" name="requestedDate" value={today} />
          <input type="hidden" name="preferredTime" value="First available" />
          <p className="font-black text-slate-950">There is no date to pick</p>
          <p className="mt-1 font-bold text-slate-700">
            A season covers every storm
            {sizing ? ` from ${sizing.season}` : ""}. The crew rolls automatically
            {sizing ? ` at ${sizing.triggerCm} cm` : ""} — you never call. Operations sends back a
            contract with the payment schedule before anything starts.
          </p>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="requestedDate" className="font-black">
              Requested date
            </Label>
            <input
              id="requestedDate"
              name="requestedDate"
              type="date"
              required
              min={today}
              defaultValue={today}
              className="h-12 rounded-lg border-2 border-sky-100 bg-white px-3 font-semibold"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="preferredTime" className="font-black">
              Window
            </Label>
            <select
              id="preferredTime"
              name="preferredTime"
              defaultValue="First available"
              className="h-12 rounded-lg border-2 border-sky-100 bg-white px-2.5 text-sm font-bold"
            >
              {PREFERRED_TIMES.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="customerNotes" className="font-black">
          Notes for operations
        </Label>
        <Textarea
          id="customerNotes"
          name="customerNotes"
          placeholder="Ice dams on the north eaves. Cars will be moved."
          className="border-2 border-sky-100 font-semibold"
        />
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle className="font-black">Unable to request this visit</AlertTitle>
          <AlertDescription className="font-semibold">{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={pending}
          className="h-12 bg-sky-700 px-6 font-black text-white hover:bg-sky-800"
        >
          {pending ? "Sending…" : seasonal ? "Request this season" : "Request this visit"}
        </Button>
        <Link href="/customer" className="inline-flex h-12 items-center px-3 font-bold text-slate-600 underline">
          Cancel
        </Link>
      </div>
      <p className="font-bold text-slate-600">
        Prices are the published rate for this driveway. This is a request — operations confirms the
        rate,{" "}
        {seasonal ? "sends back a contract to approve" : "no crew is dispatched yet"}, and no card
        is charged.
      </p>
    </form>
  );
}
