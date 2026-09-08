import type { Metadata } from "next";
import Link from "next/link";
import { StatusPill } from "@/components/bookings/status-pill";
import { JobCard } from "@/components/jobs/job-card";
import { listReviewRequests } from "@/lib/bookings/queries";
import { requestStatusLabel, woodOrderStatusLabel } from "@/lib/bookings/labels";
import { listOpenWoodOrders } from "@/lib/firewood/order-queries";
import { listOpenJobs } from "@/lib/jobs/queries";
import { formatCadFromCents } from "@/lib/money";

export const metadata: Metadata = {
  title: "Operations",
};

export default async function AdminDashboardPage() {
  const [requests, orders, jobs] = await Promise.all([
    listReviewRequests(),
    listOpenWoodOrders(),
    listOpenJobs(),
  ]);
  const ready = requests.filter((request) => request.status === "APPROVED");
  const inbox = requests.filter((request) => request.status !== "APPROVED");

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-orange-700 px-5 py-7 text-white">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200">
          Operations
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Inbox</h1>
        <p className="mt-3 max-w-2xl text-lg font-bold text-white/90">
          Approve visits, dispatch jobs, and watch storms. Stripe is still next.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/admin/storms" className="inline-flex h-12 items-center rounded-xl bg-white px-5 font-black text-slate-950">
            Storm desk
          </Link>
          <Link href="/admin/people" className="inline-flex h-12 items-center font-black text-amber-100 underline">
            People
          </Link>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl font-black text-slate-950">Snow visits</h2>
        {inbox.length === 0 ? (
          <p className="font-bold text-slate-600">No open visit requests.</p>
        ) : (
          inbox.map((request) => (
            <Link
              key={request.id}
              href={`/admin/requests/${request.id}`}
              className="rounded-3xl border-2 border-sky-100 bg-white p-4 hover:border-sky-400"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-black text-slate-950">{request.service_name}</p>
                  <p className="font-bold text-sky-800">
                    {request.customer_name} · {request.property_name}
                  </p>
                  <p className="font-bold text-slate-600">{request.requested_date}</p>
                </div>
                <StatusPill label={requestStatusLabel(request.status)} tone="ice" />
              </div>
            </Link>
          ))
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl font-black text-slate-950">Wood loads</h2>
        {orders.length === 0 ? (
          <p className="font-bold text-slate-600">No open wood requests.</p>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="rounded-3xl border-2 border-orange-100 bg-white p-4 hover:border-orange-400"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-black text-slate-950">{order.product_name}</p>
                  <p className="font-bold text-orange-800">
                    {order.customer_name} · {formatCadFromCents(order.total)}
                  </p>
                  <p className="font-bold text-slate-600">{order.property_name}</p>
                </div>
                <StatusPill label={woodOrderStatusLabel(order.status)} tone="fire" />
              </div>
            </Link>
          ))
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-2xl font-black text-slate-950">Ready to dispatch</h2>
        {ready.length === 0 ? (
          <p className="font-bold text-slate-600">No approved visits waiting for a job.</p>
        ) : (
          ready.map((request) => (
            <Link
              key={request.id}
              href={`/admin/requests/${request.id}`}
              className="rounded-3xl border-2 border-emerald-100 bg-white p-4 hover:border-emerald-400"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-black text-slate-950">{request.service_name}</p>
                  <p className="font-bold text-emerald-800">
                    {request.customer_name} · {request.property_name}
                  </p>
                </div>
                <StatusPill label={requestStatusLabel(request.status)} tone="forest" />
              </div>
            </Link>
          ))
        )}
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-slate-950">Open jobs</h2>
          <Link href="/admin/jobs" className="font-black text-sky-800 underline">
            All jobs
          </Link>
        </div>
        {jobs.length === 0 ? (
          <p className="font-bold text-slate-600">No dispatched jobs yet.</p>
        ) : (
          jobs.slice(0, 4).map((job) => (
            <JobCard key={job.id} job={job} href={`/admin/jobs/${job.id}`} />
          ))
        )}
      </section>
    </div>
  );
}
