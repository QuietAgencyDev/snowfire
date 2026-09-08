"use client";

import type { ReactNode } from "react";
import { Menu } from "@base-ui/react/menu";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/lib/navigation/links";

export const popupClass =
  "z-50 min-w-64 origin-[var(--transform-origin)] rounded-2xl border-2 border-sky-100 bg-white p-2 shadow-xl shadow-sky-900/10 transition-[opacity,transform] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0";

export const itemClass =
  "block cursor-pointer rounded-xl px-3 py-2 outline-none data-[highlighted]:bg-sky-50";

export function NavMenuLink({
  item,
  active,
}: {
  item: NavLink;
  active: boolean;
}) {
  return (
    <Menu.LinkItem
      closeOnClick
      render={<Link href={item.href} />}
      className={cn(itemClass, active && "bg-sky-50")}
    >
      <span
        className={cn(
          "block text-sm font-black",
          active ? "text-orange-700" : "text-slate-950",
        )}
      >
        {item.label}
      </span>
      <span className="mt-0.5 block text-xs font-bold text-slate-500">
        {item.detail}
      </span>
    </Menu.LinkItem>
  );
}

export function NavMenu({
  label,
  active,
  children,
  align = "start",
  trigger,
}: {
  label: string;
  active?: boolean;
  children: ReactNode;
  align?: "start" | "center" | "end";
  trigger?: ReactNode;
}) {
  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        className={cn(
          "group inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-sm font-black outline-none transition-colors hover:bg-sky-50 focus-visible:ring-3 focus-visible:ring-sky-300 data-[popup-open]:bg-sky-50",
          active ? "text-orange-700" : "text-sky-900",
        )}
        aria-label={trigger ? label : undefined}
      >
        {trigger ?? (
          <>
            {label}
            <ChevronDown className="size-4 transition-transform group-data-[popup-open]:rotate-180" />
          </>
        )}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={10} align={align} className="z-50">
          <Menu.Popup className={popupClass}>{children}</Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
