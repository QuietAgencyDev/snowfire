import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { roleLabel, type UserRole } from "@/lib/roles";

type AppShellProps = {
  role: UserRole;
  firstName: string;
  title: string;
  children: ReactNode;
};

export function AppShell({ role, firstName, title, children }: AppShellProps) {
  const home =
    role === "CUSTOMER" ? "/customer" : role === "CREW" ? "/crew" : "/admin";

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href={home} className="flex items-center gap-3">
            <BrandLogo size="sm" className="w-16" />
            <div>
              <p className="text-sm font-semibold tracking-tight">Snow & Fire</p>
              <p className="text-xs text-muted-foreground">{title}</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{roleLabel(role)}</Badge>
            <p className="hidden text-sm text-muted-foreground sm:block">
              {firstName || "Signed in"}
            </p>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
