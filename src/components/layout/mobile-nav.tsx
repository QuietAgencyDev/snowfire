"use client";

import { Menu } from "@base-ui/react/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon } from "lucide-react";
import { itemClass, popupClass } from "@/components/layout/nav-menu";
import { isActivePath, primaryNav, updatesHref } from "@/lib/navigation/links";
import type { UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function MobileNav({
  role,
  unreadCount,
}: {
  role: UserRole;
  unreadCount: number;
}) {
  const pathname = usePathname() ?? "";
  const entries = primaryNav(role);
  const updates = updatesHref(role);

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        aria-label="Open menu"
        className="inline-flex size-11 items-center justify-center rounded-xl border-2 border-sky-200 text-sky-900 outline-none focus-visible:ring-3 focus-visible:ring-sky-300 data-[popup-open]:bg-sky-50 md:hidden"
      >
        <MenuIcon className="size-5" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={10} align="start" className="z-50">
          <Menu.Popup className={popupClass}>
            {entries.map((entry) =>
              entry.kind === "link" ? (
                <Menu.LinkItem
                  key={entry.href}
                  closeOnClick
                  render={<Link href={entry.href} />}
                  className={cn(
                    itemClass,
                    "text-sm font-black",
                    isActivePath(pathname, entry.href)
                      ? "text-orange-700"
                      : "text-slate-950",
                  )}
                >
                  {entry.label}
                </Menu.LinkItem>
              ) : (
                <Menu.Group key={entry.label} className="mt-1 first:mt-0">
                  <Menu.GroupLabel className="px-3 pt-2 pb-1 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    {entry.label}
                  </Menu.GroupLabel>
                  {entry.items.map((item) => (
                    <Menu.LinkItem
                      key={item.href}
                      closeOnClick
                      render={<Link href={item.href} />}
                      className={cn(
                        itemClass,
                        "text-sm font-black",
                        isActivePath(pathname, item.href)
                          ? "text-orange-700"
                          : "text-slate-950",
                      )}
                    >
                      {item.label}
                    </Menu.LinkItem>
                  ))}
                </Menu.Group>
              ),
            )}
            <Menu.LinkItem
              closeOnClick
              render={<Link href={updates} />}
              className={cn(
                itemClass,
                "mt-1 flex items-center justify-between border-t-2 border-sky-50 pt-3 text-sm font-black",
                isActivePath(pathname, updates) ? "text-orange-700" : "text-slate-950",
              )}
            >
              Updates
              {unreadCount > 0 ? (
                <span className="rounded-full bg-orange-600 px-2 py-0.5 text-xs font-black text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Menu.LinkItem>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
