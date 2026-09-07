import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        That page is not part of Snow & Fire.
      </p>
      <Link href="/" className={cn(buttonVariants(), "h-11 px-5")}>
        Back home
      </Link>
    </div>
  );
}
