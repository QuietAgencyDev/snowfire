import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { BrandLogo } from "@/components/brand/brand-logo";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto mb-6 block w-48">
          <BrandLogo size="md" priority />
        </Link>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Customers, crew, and admins use the same sign-in. Your role decides
            where you land.
          </p>
          <div className="mt-6">
            <AuthForm mode="login" configured={isSupabaseConfigured()} />
          </div>
        </div>
      </div>
    </div>
  );
}
