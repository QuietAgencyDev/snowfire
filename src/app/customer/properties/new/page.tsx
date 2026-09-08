import type { Metadata } from "next";
import { PropertyForm } from "@/components/properties/property-form";

export const metadata: Metadata = {
  title: "Add property",
};

export default function NewPropertyPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-orange-500 px-5 py-6 text-white">
        <h1 className="text-4xl font-black tracking-tight">Add your property</h1>
        <p className="mt-2 max-w-2xl text-lg font-bold text-white/90">
          Start with the address. Tap See my local weather, then tick salted,
          unsalted, and every surface you want cleared.
        </p>
      </div>
      <PropertyForm />
    </div>
  );
}
