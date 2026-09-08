import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionProfile } from "@/lib/auth/session";
import { getCustomerProperty } from "@/lib/properties/queries";
import { PropertyForm } from "@/components/properties/property-form";

export const metadata: Metadata = {
  title: "Edit property",
};

export default async function EditPropertyPage({
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

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-sky-600 px-5 py-6 text-white">
        <h1 className="text-4xl font-black tracking-tight">Edit property</h1>
        <p className="mt-2 max-w-2xl text-lg font-bold text-white/90">
          Change the address to refresh the pin and the local forecast. Treatment
          checkboxes stay with the property.
        </p>
      </div>
      <PropertyForm property={property} />
    </div>
  );
}
