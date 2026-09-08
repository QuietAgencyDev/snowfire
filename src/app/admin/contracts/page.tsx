import type { Metadata } from "next";
import { ContractCard } from "@/components/contracts/contract-card";
import { listContracts } from "@/lib/contracts/queries";
import { formatCadFromCents } from "@/lib/money";
import { getOntarioTaxBps } from "@/lib/settings/queries";

export const metadata: Metadata = {
  title: "Contracts",
};

export default async function AdminContractsPage() {
  const [contracts, taxBps] = await Promise.all([listContracts(), getOntarioTaxBps()]);
  const live = contracts.filter((contract) => contract.status === "ACTIVE");
  const booked = live.reduce((total, contract) => total + contract.price, 0);

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-emerald-800 px-5 py-7 text-white">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">
          Seasonal book
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Contracts</h1>
        <p className="mt-3 max-w-2xl text-lg font-bold text-white/90">
          {live.length} active {live.length === 1 ? "season" : "seasons"} ·{" "}
          {formatCadFromCents(booked)} booked before tax. Issue new ones from an approved seasonal
          request.
        </p>
      </section>

      {contracts.length === 0 ? (
        <p className="font-bold text-slate-700">
          No contracts yet. Approve a seasonal request, then issue the contract from it.
        </p>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              taxBps={taxBps}
              href={`/admin/contracts/${contract.id}`}
              showCustomer
            />
          ))}
        </div>
      )}
    </div>
  );
}
