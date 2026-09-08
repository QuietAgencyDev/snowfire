import { cn } from "@/lib/utils";

type StatusPillProps = {
  label: string;
  tone?: "ice" | "fire" | "forest" | "slate";
};

const tones = {
  ice: "bg-sky-100 text-sky-900",
  fire: "bg-orange-100 text-orange-900",
  forest: "bg-emerald-100 text-emerald-900",
  slate: "bg-slate-200 text-slate-800",
};

export function StatusPill({ label, tone = "slate" }: StatusPillProps) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-sm font-black", tones[tone])}>
      {label}
    </span>
  );
}
