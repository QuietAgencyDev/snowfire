import Link from "next/link";
import {
  billingFrequencyLabel,
  billingSchedule,
  contractStatusLabel,
} from "@/lib/contracts/terms";
import { applyTaxBps, formatCadFromCents } from "@/lib/money";
import type { ContractView } from "@/types/database";

const STATUS_TONE: Record<string, string> = {
  DRAFT: "bg-amber-100 text-amber-900",
  ACTIVE: "bg-emerald-100 text-emerald-900",
  PAUSED: "bg-sky-100 text-sky-900",
  EXPIRED: "bg-slate-200 text-slate-700",
  CANCELLED: "bg-rose-100 text-rose-900",
};

type ContractCardProps = {
  contract: ContractView;
  taxBps: number;
  href?: string;
  showCustomer?: boolean;
};

export function ContractCard({
  contract,
  taxBps,
  href,
  showCustomer = false,
}: ContractCardProps) {
  const frequency = contract.billing_frequency === "MONTHLY" ? "MONTHLY" : "PREPAID";
  const schedule = billingSchedule({
    amountCents: contract.price,
    frequency,
    startDate: contract.start_date,
    endDate: contract.end_date ?? contract.start_date,
  });
  const due = schedule.reduce((total, item) => total + item.amountCents, 0);
  const withTax = due + applyTaxBps(due, taxBps);

  return (
    <article className="rounded-3xl border-2 border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-950">{contract.property_name}</h2>
          <p className="font-bold text-slate-700">{contract.property_address}</p>
          {showCustomer ? (
            <p className="mt-1 font-bold text-sky-800">
              {contract.customer_name} · {contract.customer_email}
            </p>
          ) : null}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${
            STATUS_TONE[contract.status] ?? "bg-slate-200 text-slate-700"
          }`}
        >
          {contractStatusLabel(contract.status)}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 font-bold text-slate-800 sm:grid-cols-2">
        <div>
          <dt className="font-black text-slate-500">Covered</dt>
          <dd>
            {contract.start_date} to {contract.end_date ?? "open"}
          </dd>
        </div>
        <div>
          <dt className="font-black text-slate-500">Season price</dt>
          <dd>
            {formatCadFromCents(due)} · {formatCadFromCents(withTax)} with HST
          </dd>
        </div>
        <div>
          <dt className="font-black text-slate-500">Billing</dt>
          <dd>{billingFrequencyLabel(frequency)}</dd>
        </div>
        <div>
          <dt className="font-black text-slate-500">Service</dt>
          <dd>{contract.service_name}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-2xl border-2 border-sky-100 bg-sky-50 p-4">
        <p className="font-black text-slate-950">Payment schedule</p>
        <ul className="mt-2 grid gap-1 font-bold text-slate-800">
          {schedule.map((instalment) => (
            <li key={instalment.dueDate} className="flex justify-between gap-3">
              <span>
                {instalment.label} · {instalment.dueDate}
              </span>
              <span className="font-black">{formatCadFromCents(instalment.amountCents)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 font-bold text-slate-600">
          Stripe is not live, so nothing is charged on these dates yet.
        </p>
      </div>

      {contract.terms ? (
        <p className="mt-4 whitespace-pre-line font-bold text-slate-700">{contract.terms}</p>
      ) : null}

      {href ? (
        <Link href={href} className="mt-4 inline-flex h-12 items-center font-black text-sky-800 underline">
          Open contract
        </Link>
      ) : null}
    </article>
  );
}
