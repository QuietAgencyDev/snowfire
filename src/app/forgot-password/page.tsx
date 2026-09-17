import type { Metadata } from "next";
import Link from "next/link";
import { PasswordResetRequestForm } from "@/components/auth/password-reset-request-form";
import { BrandLogo } from "@/components/brand/brand-logo";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="relative mx-auto mb-6 block w-52">
          <BrandLogo variant="mascot" size="md" priority />
        </Link>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the email you signed up with and we will send you a link to set
            a new password.
          </p>
          <div className="mt-6">
            <PasswordResetRequestForm configured={isSupabaseConfigured()} />
          </div>
        </div>
      </div>
    </div>
  );
}
