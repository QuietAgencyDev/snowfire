type ComingSoonProps = {
  title: string;
  description: string;
};

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
        Coming soon
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
      <p className="mt-2 font-bold leading-6 text-slate-700">{description}</p>
    </div>
  );
}
