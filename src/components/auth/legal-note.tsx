import Link from "next/link";

// Shown where an account is created or signed into, because that is the moment
// the terms actually start applying — and because Google's consent screen review
// looks for these to be reachable, not just to exist.
export function LegalNote() {
  return (
    <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
      By continuing you agree to our{" "}
      <Link href="/terms" className="underline">
        terms of service
      </Link>{" "}
      and{" "}
      <Link href="/privacy" className="underline">
        privacy policy
      </Link>
      .
    </p>
  );
}
