"use client";

import { useState } from "react";
import { signInWithOAuthAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

type OAuthButtonsProps = {
  configured: boolean;
  google?: boolean;
  apple?: boolean;
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.2-1.6 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.6-2.6C16.8 3 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="currentColor"
        d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 3 2.3 1.2 0 1.6-.7 3.1-.7s1.8.7 3.1.7 2.1-1.1 2.8-2.2c.9-1.2 1.2-2.4 1.2-2.5-.1 0-2.3-.9-2.3-3.8zM14.7 5.8c.6-.8 1.1-1.9.9-3-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.6-1.3z"
      />
    </svg>
  );
}

export function OAuthButtons({
  configured,
  google = false,
  apple = false,
}: OAuthButtonsProps) {
  const [pendingProvider, setPendingProvider] = useState<"google" | "apple" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  if (!google && !apple) {
    return null;
  }

  async function start(provider: "google" | "apple") {
    if (!configured || pendingProvider) {
      return;
    }

    setError(null);
    setPendingProvider(provider);

    const result = await signInWithOAuthAction(provider);

    if (result?.error) {
      setError(result.error);
      setPendingProvider(null);
    }
  }

  return (
    <div className="grid gap-3">
      {google ? (
        <Button
          type="button"
          variant="outline"
          disabled={!configured || pendingProvider !== null}
          onClick={() => void start("google")}
          className="h-12 w-full gap-2 text-base"
        >
          <GoogleIcon />
          {pendingProvider === "google" ? "Redirecting…" : "Continue with Google"}
        </Button>
      ) : null}
      {apple ? (
        <Button
          type="button"
          variant="outline"
          disabled={!configured || pendingProvider !== null}
          onClick={() => void start("apple")}
          className="h-12 w-full gap-2 bg-foreground text-base text-background hover:bg-foreground/90 hover:text-background"
        >
          <AppleIcon />
          {pendingProvider === "apple" ? "Redirecting…" : "Continue with Apple"}
        </Button>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
