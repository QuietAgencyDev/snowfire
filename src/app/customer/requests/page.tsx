import type { Metadata } from "next";
import Link from "next/link";
import { StatusPill } from "@/components/bookings/status-pill";
import { getSessionProfile } from "@/lib/auth/session";
import { listCustomerRequests } from "@/lib/bookings/queries";
import { requestStatusLabel, woodOrderStatusLabel } from "@/lib/bookings/labels";
import { listCustomerWoodOrders } from "@/lib/firewood/order-queries";
import { formatCadFromCents } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Requests",
};

function requestTone(status: string) {
  if (status === "APPROVED") return "forest" as const;
  if (status === "DECLINED" || status === "CANCELLED") return "slate" as const;
  if (status === "ADMIN_REVIEW" || status === "CUSTOMER_REQUESTED") return "ice" as const;
  return "slate" as const;
}

function woodTone(status: string) {
  if (status === "CONFIRMED") return "forest" as const;
  if (status === "PENDING") return "fire" as const;
  return "slate" as const;
}

export default async function RequestsPage() {
  const profile = await getSessionProfile();
  const [requests, orders] = profile
    ? await Promise.all([
        listCustomerRequests(profile.id),
        listCustomerWoodOrders(profile.id),
      ])
    : [[], []];

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-sky-800 px-5 py-7 text-white">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200">
          Your file
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Requests</h1>
        <p className="mt-3 max-w-2xl text-lg font-bold text-white/90">
          Snow visits and wood loads you actually sent. Nothing here is invented.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/customer/book"
            className={cn(buttonVariants({ variant: "secondary" }), "h-12 bg-white px-4 font-black text-slate-950")}
          >
            Book snow
          </Link>
          <Link
            href="/customer/firewood"
            className="inline-flex h-12 items-center font-black text-amber-100 underline"
          >
            Wood yard
          </Link>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl font-black text-slate-950">Snow visits</h2>
        {requests.length === 0 ? (
          <p className="font-bold text-slate-600">No visit requests yet.</p>
        ) : (
          requests.map((request) => (
            <Link
              key={request.id}
              href={`/customer/requests/${request.id}`}
              className="rounded-3xl border-2 border-sky-100 bg-white p-4 hover:border-sky-400"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-black text-slate-950">{request.service_name}</p>
                  <p className="font-bold text-sky-800">{request.property_name}</p>
                  <p className="font-bold text-slate-600">{request.requested_date}</p>
                </div>
                <StatusPill label={requestStatusLabel(request.status)} tone={requestTone(request.status)} />
              </div>
            </Link>
          ))
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl font-black text-slate-950">Wood loads</h2>
        {orders.length === 0 ? (
          <p className="font-bold text-slate-600">No wood requests yet.</p>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/customer/orders/${order.id}`}
              className="rounded-3xl border-2 border-orange-100 bg-white p-4 hover:border-orange-400"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-black text-slate-950">{order.product_name}</p>
                  <p className="font-bold text-orange-800">
                    {order.quantity} {order.quantity_unit} · {formatCadFromCents(order.total)}
                  </p>
                  <p className="font-bold text-slate-600">{order.property_name}</p>
                </div>
                <StatusPill label={woodOrderStatusLabel(order.status)} tone={woodTone(order.status)} />
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
