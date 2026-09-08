import type { UserRole } from "@/lib/roles";

export type NavLink = {
  label: string;
  href: string;
  detail: string;
};

export type NavEntry =
  | { kind: "link"; label: string; href: string }
  | { kind: "menu"; label: string; items: NavLink[] };

const ROLE_ROOTS = new Set(["/customer", "/crew", "/admin"]);

export function updatesHref(role: UserRole): string {
  if (role === "CUSTOMER") {
    return "/customer/updates";
  }

  if (role === "CREW") {
    return "/crew/updates";
  }

  return "/admin/updates";
}

export function primaryNav(role: UserRole): NavEntry[] {
  if (role === "CUSTOMER") {
    return [
      { kind: "link", label: "Home", href: "/customer" },
      {
        kind: "menu",
        label: "Properties",
        items: [
          {
            label: "All properties",
            href: "/customer/properties",
            detail: "Winter files, pins, and driveway photos",
          },
          {
            label: "Add a property",
            href: "/customer/properties/new",
            detail: "Put a new address on the map",
          },
        ],
      },
      {
        kind: "menu",
        label: "Book",
        items: [
          {
            label: "Snow visit",
            href: "/customer/book",
            detail: "Pick a property, a service, and a date",
          },
          {
            label: "Firewood yard",
            href: "/customer/firewood",
            detail: "Cords, kindling, and the cord calculator",
          },
        ],
      },
      {
        kind: "menu",
        label: "Activity",
        items: [
          {
            label: "Requests",
            href: "/customer/requests",
            detail: "Visits and wood loads waiting on review",
          },
          {
            label: "Jobs",
            href: "/customer/jobs",
            detail: "Dispatched work and before / after proof",
          },
          {
            label: "Seasons",
            href: "/customer/contracts",
            detail: "Seasonal coverage and the payment schedule",
          },
        ],
      },
    ];
  }

  if (role === "CREW") {
    return [{ kind: "link", label: "Route", href: "/crew" }];
  }

  return [
    { kind: "link", label: "Inbox", href: "/admin" },
    {
      kind: "menu",
      label: "Operations",
      items: [
        {
          label: "Open jobs",
          href: "/admin/jobs",
          detail: "Dispatched work and crew assignment",
        },
        {
          label: "Storm desk",
          href: "/admin/storms",
          detail: "Score driveways against the live forecast",
        },
        {
          label: "Contracts",
          href: "/admin/contracts",
          detail: "The seasonal book and what is billed when",
        },
        {
          label: "People",
          href: "/admin/people",
          detail: "Customers, crew, and admins on this project",
        },
      ],
    },
  ];
}

export function navHrefs(role: UserRole): string[] {
  return primaryNav(role).flatMap((entry) =>
    entry.kind === "link" ? [entry.href] : entry.items.map((item) => item.href),
  );
}

export function isActivePath(pathname: string, href: string): boolean {
  if (pathname === href) {
    return true;
  }

  if (ROLE_ROOTS.has(href)) {
    return false;
  }

  return pathname.startsWith(`${href}/`);
}

export function isActiveEntry(pathname: string, entry: NavEntry): boolean {
  if (entry.kind === "link") {
    return isActivePath(pathname, entry.href);
  }

  return entry.items.some((item) => isActivePath(pathname, item.href));
}

export function initials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  const stamp = `${first}${last}`.toUpperCase();

  return stamp || "SF";
}
