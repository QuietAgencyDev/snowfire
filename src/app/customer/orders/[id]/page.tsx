import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/bookings/status-pill";
import { getSessionProfile } from "@/lib/auth/session";
import { customerCanCancelWoodOrder, woodOrderStatusLabel } from "@/lib/bookings/labels";
import { cancelWoodRequestAction } from "@/lib/firewood/order-actions";
import { getCustomerWoodOrder } from "@/lib/firewood/order-queries";
import { formatCadFromCents } from "@/lib/money";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Wood request",
};

export default async function CustomerWoodOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getSessionProfile();

  if (!profile) {
    notFound();
  }

  const order = await getCustomerWoodOrder(id, profile.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="grid gap-5">
      <Link href="/customer/requests" className="font-black text-orange-800 underline">
        Back to requests
      </Link>
      <article className="rounded-3xl border-2 border-orange-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
              Firewood
            </p>
            <h1 className="mt-2 text-4xl font-black text-slate-950">{order.product_name}</h1>
            <p className="mt-2 text-lg font-bold text-orange-800">{order.property_name}</p>
            <p className="font-bold text-slate-700">{order.property_address}</p>
          </div>
          <StatusPill
            label={woodOrderStatusLabel(order.status)}
            tone={order.status === "CONFIRMED" ? "forest" : "fire"}
          />
        </div>
        <dl className="mt-6 grid gap-3 font-bold text-slate-800">
          <div>
            <dt className="font-black text-slate-500">Load</dt>
            <dd>
              {order.quantity} {order.quantity_unit}
            </dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Requested date</dt>
            <dd>{order.delivery_date || "Pickup / flexible"}</dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Totals</dt>
            <dd>
              {formatCadFromCents(order.subtotal)} + {formatCadFromCents(order.tax)} HST ={" "}
              {formatCadFromCents(order.total)}
            </dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Notes</dt>
            <dd>{order.delivery_notes || "None"}</dd>
          </div>
        </dl>
        <p className="mt-6 font-bold text-slate-600">
          Not paid. Stripe is not live. Inventory only drops when operations accepts the load.
        </p>
        {customerCanCancelWoodOrder(order.status) ? (
          <form action={cancelWoodRequestAction} className="mt-5">
            <input type="hidden" name="orderId" value={order.id} />
            <Button type="submit" variant="outline" className="h-12 border-2 font-black">
              Cancel this request
            </Button>
          </form>
        ) : null}
      </article>
    </div>
  );
}
