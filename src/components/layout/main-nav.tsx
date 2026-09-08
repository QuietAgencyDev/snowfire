"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavMenu, NavMenuLink } from "@/components/layout/nav-menu";
import {
  isActiveEntry,
  isActivePath,
  primaryNav,
} from "@/lib/navigation/links";
import type { UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function MainNav({ role }: { role: UserRole }) {
  const pathname = usePathname() ?? "";
  const entries = primaryNav(role);

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {entries.map((entry) => {
        const active = isActiveEntry(pathname, entry);

        if (entry.kind === "link") {
          return (
            <Link
              key={entry.href}
              href={entry.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-xl px-2.5 py-1.5 text-sm font-black transition-colors hover:bg-sky-50",
                active ? "text-orange-700" : "text-sky-900",
              )}
            >
              {entry.label}
            </Link>
          );
        }

        return (
          <NavMenu key={entry.label} label={entry.label} active={active}>
            {entry.items.map((item) => (
              <NavMenuLink
                key={item.href}
                item={item}
                active={isActivePath(pathname, item.href)}
              />
            ))}
          </NavMenu>
        );
      })}
    </nav>
  );
}
