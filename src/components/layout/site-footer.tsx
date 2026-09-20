import Link from "next/link";
import { BUSINESS } from "@/lib/legal/business";

// Google will not publish an OAuth consent screen without reachable privacy and
// terms links, and people look for them at the bottom of the page regardless.
export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        © {new Date().getFullYear()} {BUSINESS.name} · Snow removal and firewood in{" "}
        {BUSINESS.serviceArea}.
      </p>
      <nav className="flex gap-4">
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacy
        </Link>
        <Link href="/terms" className="underline hover:text-foreground">
          Terms
        </Link>
      </nav>
    </footer>
  );
}
