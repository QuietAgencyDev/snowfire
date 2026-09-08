"use client";

import { Menu } from "@base-ui/react/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { itemClass, popupClass } from "@/components/layout/nav-menu";
import { signOutAction } from "@/lib/auth/actions";
import { initials, isActivePath, updatesHref } from "@/lib/navigation/links";
import { roleLabel, type UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function UserMenu({
  role,
  firstName,
  lastName,
  email,
}: {
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
}) {
  const pathname = usePathname() ?? "";
  const updates = updatesHref(role);
  const name = `${firstName} ${lastName}`.trim() || "Signed in";

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        aria-label="Account menu"
        className="inline-flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 outline-none transition-colors hover:bg-sky-50 focus-visible:ring-3 focus-visible:ring-sky-300 data-[popup-open]:bg-sky-50"
      >
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-orange-500 text-sm font-black text-white">
          {initials(firstName, lastName)}
        </span>
        <ChevronDown className="size-4 text-slate-500" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={10} align="end" className="z-50">
          <Menu.Popup className={popupClass}>
            <div className="border-b-2 border-sky-50 px-3 pb-3 pt-2">
              <p className="text-sm font-black text-slate-950">{name}</p>
              {email ? (
                <p className="mt-0.5 truncate text-xs font-bold text-slate-500">{email}</p>
              ) : null}
              <p className="mt-1 inline-block rounded-full bg-orange-50 px-2 py-0.5 text-xs font-black text-orange-800">
                {roleLabel(role)}
              </p>
            </div>
            <Menu.LinkItem
              closeOnClick
              render={<Link href={updates} />}
              className={cn(
                itemClass,
                "mt-1 text-sm font-black",
                isActivePath(pathname, updates) ? "text-orange-700" : "text-slate-950",
              )}
            >
              Updates
            </Menu.LinkItem>
            <form action={signOutAction}>
              <Menu.Item
                nativeButton
                closeOnClick={false}
                render={<button type="submit" />}
                className={cn(itemClass, "flex w-full items-center gap-2 text-sm font-black text-slate-950")}
              >
                <LogOut className="size-4" />
                Sign out
              </Menu.Item>
            </form>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
