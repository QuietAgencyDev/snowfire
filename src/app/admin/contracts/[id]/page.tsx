import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContractCard } from "@/components/contracts/contract-card";
import { ContractStatusForm } from "@/components/contracts/contract-status-form";
import { getContract } from "@/lib/contracts/queries";
import { getOntarioTaxBps } from "@/lib/settings/queries";

export const metadata: Metadata = {
  title: "Contract",
};

export default async function AdminContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contract, taxBps] = await Promise.all([getContract(id), getOntarioTaxBps()]);

  if (!contract) {
    notFound();
  }

  return (
    <div className="grid gap-5">
      <Link href="/admin/contracts" className="font-black text-sky-800 underline">
        Back to contracts
      </Link>
      <ContractCard contract={contract} taxBps={taxBps} showCustomer />
      <ContractStatusForm contractId={contract.id} status={contract.status} />
    </div>
  );
}
