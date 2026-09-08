import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyBriefButton } from "@/components/command/copy-brief-button";
import { PrintButton } from "@/components/command/print-button";
import { getSessionProfile } from "@/lib/auth/session";
import { buildWoodBrief, woodBriefText } from "@/lib/firewood/brief";
import { getCustomerProperty } from "@/lib/properties/queries";

export const metadata: Metadata = {
  title: "Wood delivery",
};

export default async function WoodBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getSessionProfile();

  if (!profile) {
    notFound();
  }

  const property = await getCustomerProperty(id, profile.id);

  if (!property) {
    notFound();
  }

  const brief = buildWoodBrief({ property, profile });
  const text = woodBriefText(brief);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/customer/firewood" className="font-black text-orange-800 underline">
          Back to the wood yard
        </Link>
        <div className="flex flex-wrap gap-2">
          <CopyBriefButton text={text} />
          <PrintButton />
        </div>
      </div>

      <article className="rounded-3xl border-2 border-slate-900 bg-white p-6 print:border-0">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
          SnowFire.ca · bois / wood delivery
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">{brief.title}</h1>
        <p className="mt-2 text-xl font-bold text-orange-800">{brief.address}</p>
        <p className="mt-1 font-black text-slate-800">
          {brief.client} · {brief.phone}
        </p>

        <dl className="mt-6 grid gap-3 font-bold">
          <div>
            <dt className="font-black text-slate-500">How / comment</dt>
            <dd>{brief.how.join(" · ") || "None checked"}</dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Where / où</dt>
            <dd>{brief.where.join(" · ") || "None checked"}</dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Stack / pile</dt>
            <dd>{brief.stack}</dd>
          </div>
          <div>
            <dt className="font-black text-slate-500">Notes</dt>
            <dd>{brief.notes}</dd>
          </div>
        </dl>

        <p className="mt-8 text-sm font-bold text-slate-500">
          This is the woodshed file. It is not a paid order and it does not invent a delivery.
        </p>
      </article>
    </div>
  );
}
