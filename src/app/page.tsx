import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-[radial-gradient(circle_at_top,_#e8eef3_0%,_#f4f6f8_42%,_#ffffff_100%)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="block w-44 sm:w-52">
          <BrandLogo variant="lettering" size="sm" priority />
        </Link>
        <div className="flex gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "h-11 px-4")}>
            Sign in
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ variant: "success" }), "h-11 px-4")}
          >
            Create account
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-16 pt-4 lg:flex-row lg:items-center lg:gap-12">
        <div className="relative w-full max-w-md lg:max-w-xl">
          <BrandLogo variant="mascot" size="lg" priority className="relative mx-auto" />
        </div>
        <div className="mt-6 max-w-xl text-center lg:mt-0 lg:text-left">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Property service operations
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Snow cleared. Firewood delivered. Proof on file.
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            SnowFire.ca is built around the property — not a one-off ticket.
            Driveways, roof salt pucks, and a live wood yard live on the same
            address. Crews document the work. You keep the history.
          </p>
          <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
            <div className="rounded-2xl border border-sky-200 bg-white/80 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">
                Snow
              </p>
              <p className="mt-1 font-semibold text-foreground">
                Local weather, ice-dam watch, and salt pucks on the eaves.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-white/80 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-700">
                Fire
              </p>
              <p className="mt-1 font-semibold text-foreground">
                Seasoned hardwood, a cord calculator, and a truck-ready crib file.
              </p>
            </div>
          </div>
          <div className="mt-8 flex justify-center lg:justify-start">
            <Link
              href="/signup"
              className={cn(buttonVariants({ variant: "success" }), "h-14 px-8 text-base")}
            >
              Customer sign up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
