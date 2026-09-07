export const USER_ROLES = [
  "CUSTOMER",
  "CREW",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: string | null | undefined): value is UserRole {
  return Boolean(value && (USER_ROLES as readonly string[]).includes(value));
}

export function isAdminRole(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function homePathForRole(role: UserRole): string {
  switch (role) {
    case "CUSTOMER":
      return "/customer";
    case "CREW":
      return "/crew";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin";
  }
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith("/customer")) {
    return role === "CUSTOMER";
  }

  if (pathname.startsWith("/crew")) {
    return role === "CREW";
  }

  if (pathname.startsWith("/admin")) {
    return isAdminRole(role);
  }

  return true;
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "CUSTOMER":
      return "Customer";
    case "CREW":
      return "Crew";
    case "ADMIN":
      return "Admin";
    case "SUPER_ADMIN":
      return "Super admin";
  }
}
