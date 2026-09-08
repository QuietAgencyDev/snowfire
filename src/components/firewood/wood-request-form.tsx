"use client";

import { useActionState } from "react";
import { createWoodRequestAction, type WoodOrderFormState } from "@/lib/firewood/order-actions";
import { formatCadFromCents } from "@/lib/money";
import { quoteFirewoodLoad, todayInTimeZone } from "@/lib/pricing/quote-math";
import { formatPropertyAddress } from "@/lib/properties/address";
import type { FirewoodProduct, Property } from "@/types/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: WoodOrderFormState = {};

type WoodRequestFormProps = {
  product: FirewoodProduct;
  properties: Property[];
  taxBps: number;
};

export function WoodRequestForm({ product, properties, taxBps }: WoodRequestFormProps) {
  const [state, formAction, pending] = useActionState(createWoodRequestAction, initialState);
  const today = todayInTimeZone("America/Toronto");
  const sample = quoteFirewoodLoad({
    unitPriceCents: product.price,
    quantity: 1,
    taxBps,
  });

  return (
    <form action={formAction} className="grid gap-4 rounded-3xl border-2 border-orange-200 bg-white p-5">
      <input type="hidden" name="productId" value={product.id} />
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
          Request this load
        </p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">Not paid. Not confirmed.</h2>
        <p className="mt-1 font-bold text-slate-700">
          One {product.quantity_unit} is {formatCadFromCents(product.price)} plus HST
          ({formatCadFromCents(sample.total)} with tax). Stripe checkout is not live.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="propertyId" className="font-black">
          Property
        </Label>
        <select
          id="propertyId"
          name="propertyId"
          required
          defaultValue={properties[0]?.id}
          className="h-12 rounded-lg border-2 border-orange-100 bg-white px-2.5 text-sm font-bold"
        >
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name} — {formatPropertyAddress(property)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="quantity" className="font-black">
            Quantity
          </Label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            max={product.inventory_quantity}
            step="1"
            defaultValue="1"
            required
            className="h-12 rounded-lg border-2 border-orange-100 bg-white px-3 font-semibold"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="fulfillment" className="font-black">
            How it moves
          </Label>
          <select
            id="fulfillment"
            name="fulfillment"
            defaultValue={product.delivery_available ? "delivery" : "pickup"}
            className="h-12 rounded-lg border-2 border-orange-100 bg-white px-2.5 text-sm font-bold"
          >
            {product.delivery_available ? <option value="delivery">Deliver here</option> : null}
            {product.pickup_available ? <option value="pickup">Pickup at the yard</option> : null}
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="deliveryDate" className="font-black">
          Requested date
        </Label>
        <input
          id="deliveryDate"
          name="deliveryDate"
          type="date"
          min={today}
          defaultValue={today}
          className="h-12 rounded-lg border-2 border-orange-100 bg-white px-3 font-semibold"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="deliveryNotes" className="font-black">
          Notes
        </Label>
        <Textarea
          id="deliveryNotes"
          name="deliveryNotes"
          placeholder="Stack on the crib left of the garage. Do not block the side door."
          className="border-2 border-orange-100 font-semibold"
        />
      </div>

      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle className="font-black">Unable to request this load</AlertTitle>
          <AlertDescription className="font-semibold">{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        disabled={pending || product.inventory_quantity < 1}
        className="h-12 bg-orange-600 px-6 font-black text-white hover:bg-orange-700"
      >
        {pending ? "Sending…" : "Request this load"}
      </Button>
    </form>
  );
}
