import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewWoodForm } from "@/components/admin/review-wood-form";
import { StatusPill } from "@/components/bookings/status-pill";
import { woodOrderStatusLabel } from "@/lib/bookings/labels";
import { getAdminWoodOrder } from "@/lib/firewood/order-queries";
import { formatCadFromCents } from "@/lib/money";

export const metadata: Metadata = {
  title: "Review wood",
};

export default async function AdminWoodOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminWoodOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="grid gap-5">
      <Link href="/admin" className="font-black text-orange-800 underline">
        Back to inbox
      </Link>
      <article className="rounded-3xl border-2 border-orange-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black text-slate-950">{order.product_name}</h1>
            <p className="mt-2 text-lg font-bold text-orange-800">{order.customer_name}</p>
            <p className="mt-2 font-bold text-slate-800">{order.property_name}</p>
            <p className="font-bold text-slate-700">{order.property_address}</p>
          </div>
          <StatusPill label={woodOrderStatusLabel(order.status)} tone="fire" />
        </div>
        <dl className="mt-6 grid gap-3 font-bold text-slate-800">
          <div>
            <dt className="font-black text-slate-500">Load</dt>
            <dd>
              {order.quantity} {order.quantity_unit}
            </dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Date</dt>
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
        <div className="mt-6">
          {order.status === "PENDING" ? (
            <ReviewWoodForm orderId={order.id} />
          ) : (
            <p className="font-bold text-slate-600">This load is no longer pending.</p>
          )}
        </div>
      </article>
    </div>
  );
}
