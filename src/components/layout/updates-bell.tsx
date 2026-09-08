"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { isActivePath, updatesHref } from "@/lib/navigation/links";
import type { UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function UpdatesBell({
  role,
  unreadCount,
}: {
  role: UserRole;
  unreadCount: number;
}) {
  const pathname = usePathname() ?? "";
  const href = updatesHref(role);
  const active = isActivePath(pathname, href);
  const label =
    unreadCount === 0
      ? "Updates"
      : `Updates, ${unreadCount} unread`;

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "relative hidden size-11 items-center justify-center rounded-xl transition-colors hover:bg-sky-50 sm:inline-flex",
        active ? "bg-sky-50 text-orange-700" : "text-sky-900",
      )}
    >
      <Bell className="size-5" />
      {unreadCount > 0 ? (
        <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] font-black leading-4 text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
