import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NewPasswordForm } from "@/components/auth/new-password-form";
import { BrandLogo } from "@/components/brand/brand-logo";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Set a new password",
};

export default async function ResetPasswordPage() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/login?reason=not-configured");
  }

  // Arriving here means /auth/callback already traded the emailed code for a
  // session. Anyone reaching this page directly has no such session, and showing
  // them the form would only fail on submit — so send them to ask for a link.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password");
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="relative mx-auto mb-6 block w-52">
          <BrandLogo variant="mascot" size="md" priority />
        </Link>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a new password for {user.email}. You will stay signed in once
            it is saved.
          </p>
          <div className="mt-6">
            <NewPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
