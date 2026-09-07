import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-[radial-gradient(circle_at_top,_#e8eef3_0%,_#f4f6f8_42%,_#ffffff_100%)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <p className="text-sm font-semibold tracking-wide text-foreground">
          SNOW & FIRE
        </p>
        <div className="flex gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "h-11 px-4")}>
            Sign in
          </Link>
          <Link href="/signup" className={cn(buttonVariants(), "h-11 px-4")}>
            Create account
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-16 pt-4 lg:flex-row lg:items-center lg:gap-12">
        <div className="w-full max-w-md lg:max-w-lg">
          <BrandLogo size="lg" priority className="mx-auto" />
        </div>
        <div className="mt-6 max-w-xl text-center lg:mt-0 lg:text-left">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Property service operations
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Snow cleared. Firewood delivered. Proof on file.
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Snow & Fire is built around the property — not a one-off ticket.
            Customers book snow service and firewood. Crews document the work.
            You keep the history.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link href="/signup" className={cn(buttonVariants(), "h-12 px-6 text-base")}>
              Customer sign up
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline" }), "h-12 px-6 text-base")}
            >
              Crew or admin sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
