"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="h-12 rounded-xl border-2 border-slate-300 px-5 font-black text-slate-900"
    >
      Print
    </button>
  );
}
