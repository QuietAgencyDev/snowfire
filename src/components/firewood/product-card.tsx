import Link from "next/link";
import { woodSpeciesById } from "@/lib/firewood/catalog";
import { formatCadFromCents } from "@/lib/money";
import type { FirewoodProduct } from "@/types/database";

type ProductCardProps = {
  product: FirewoodProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const species = woodSpeciesById(product.wood_type);

  return (
    <Link
      href={`/customer/firewood/${product.id}`}
      className="grid gap-3 rounded-3xl border-2 border-orange-100 bg-white p-5 hover:border-orange-400"
    >
      <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-700">
        {product.quantity_unit}
      </p>
      <h3 className="text-xl font-black tracking-tight text-slate-950">{product.name}</h3>
      <p className="font-bold text-slate-700">{product.description}</p>
      <p className="text-3xl font-black text-orange-700">
        {formatCadFromCents(product.price)}
      </p>
      <div className="flex flex-wrap gap-2">
        {product.seasoned ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-800">
            Seasoned
          </span>
        ) : null}
        {product.kiln_dried ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-900">
            Kiln-dried
          </span>
        ) : null}
        {species ? (
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-black text-orange-900">
            {species.label}
          </span>
        ) : null}
      </div>
      <p className="font-bold text-slate-600">
        {product.inventory_quantity} in the yard
        {product.delivery_available ? " · delivery" : ""}
        {product.pickup_available ? " · pickup" : ""}
      </p>
    </Link>
  );
}
