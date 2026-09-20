import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { LEGAL_UPDATED } from "@/lib/legal/business";

// Shared chrome for the legal pages, so privacy and terms cannot drift apart in
// layout or forget to say when they were last changed.
export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="mx-auto flex w-full max-w-3xl items-center px-4 py-6">
        <Link href="/" className="block w-44">
          <BrandLogo variant="lettering" size="sm" />
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-12">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated {LEGAL_UPDATED}
        </p>
        <p className="mt-6 text-base leading-7">{intro}</p>
        <div className="mt-8 grid gap-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
      <div className="grid gap-3 text-base leading-7 text-foreground/90">{children}</div>
    </section>
  );
}
