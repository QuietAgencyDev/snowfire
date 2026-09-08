import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UpdatesBell } from "@/components/layout/updates-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { homePathForRole, type UserRole } from "@/lib/roles";

type AppShellProps = {
  role: UserRole;
  firstName: string;
  lastName?: string;
  email?: string;
  title: string;
  unreadCount?: number;
  children: ReactNode;
};

export function AppShell({
  role,
  firstName,
  lastName = "",
  email = "",
  title,
  unreadCount = 0,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#fff7ed_42%,_#f0fdf4_100%)]">
      <header className="sticky top-0 z-40 border-b-2 border-sky-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <MobileNav role={role} unreadCount={unreadCount} />
            <Link
              href={homePathForRole(role)}
              className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-sky-300"
            >
              <BrandLogo variant="wordmark" size="sm" className="h-9 w-36" />
              <span className="hidden text-xs font-black uppercase tracking-[0.16em] text-sky-700 lg:block">
                {title}
              </span>
            </Link>
            <MainNav role={role} />
          </div>
          <div className="flex items-center gap-1">
            <UpdatesBell role={role} unreadCount={unreadCount} />
            <UserMenu
              role={role}
              firstName={firstName}
              lastName={lastName}
              email={email}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
