import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ContractCard } from "@/components/contracts/contract-card";
import { getSessionProfile } from "@/lib/auth/session";
import { listCustomerContracts } from "@/lib/contracts/queries";
import { getOntarioTaxBps } from "@/lib/settings/queries";

export const metadata: Metadata = {
  title: "Seasons",
};

export default async function CustomerContractsPage() {
  const profile = await getSessionProfile();

  if (!profile) {
    redirect("/login");
  }

  const [contracts, taxBps] = await Promise.all([
    listCustomerContracts(profile.id),
    getOntarioTaxBps(),
  ]);

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl bg-gradient-to-r from-emerald-600 to-sky-800 px-5 py-7 text-white">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-100">
          Seasonal coverage
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Your seasons</h1>
        <p className="mt-3 max-w-2xl text-lg font-bold text-white/90">
          One price for the whole winter, unlimited visits every time snowfall hits your trigger.
          No calling, no per-storm invoices.
        </p>
      </section>

      {contracts.length === 0 ? (
        <section className="flex flex-wrap items-center gap-5 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5">
          <BrandLogo variant="mascot" size="sm" className="h-32 w-auto shrink-0" />
          <div className="min-w-60 flex-1">
            <h2 className="text-2xl font-black text-slate-950">No season booked yet</h2>
            <p className="mt-1 font-bold text-slate-700">
              Request the seasonal contract for a property and operations will send back a contract
              at your published rate.
            </p>
            <Link
              href="/customer/book"
              className="mt-4 inline-flex h-12 items-center rounded-xl bg-emerald-700 px-5 font-black text-white hover:bg-emerald-800"
            >
              Request a season
            </Link>
          </div>
        </section>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} taxBps={taxBps} />
          ))}
        </div>
      )}
    </div>
  );
}
