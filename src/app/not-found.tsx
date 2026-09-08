import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#fff7ed_60%,_#f0fdf4_100%)] px-4 py-12 text-center">
      <BrandLogo variant="mascot" size="md" className="h-48 w-auto" priority />
      <h1 className="text-3xl font-black tracking-tight text-slate-950">
        Nothing plowed here
      </h1>
      <p className="max-w-md font-bold text-slate-700">
        That page is not part of SnowFire.ca. The driveway you are looking for might have been
        renamed or removed.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants(), "h-12 bg-sky-700 px-5 font-black hover:bg-sky-800")}
      >
        Back home
      </Link>
    </div>
  );
}
