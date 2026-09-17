export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith("https://"));
}

export function getPublicSupabaseConfig(): { url: string; anonKey: string } | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  };
}

export function getServiceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
}

// Auth redirects and link previews both build absolute URLs, and they have to
// agree. Disagreeing is quiet and nasty: a sign-in that lands on the wrong host
// drops the session, and a preview image 404s only when someone shares a link.
// Trailing slashes are stripped here so callers can concatenate a path safely.
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  // Only production pins a host, so without this every preview deployment would
  // claim to live on localhost and hand out sign-in links that go nowhere.
  // Vercel sets this per deployment, and it never carries a scheme.
  const deployment = process.env.VERCEL_URL?.trim();

  if (deployment) {
    return `https://${deployment}`.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

export function isGoogleAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_GOOGLE === "true";
}

export function isAppleAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_APPLE === "true";
}

export function getMapsApiKey(): string | null {
  return process.env.MAPS_API_KEY || process.env.NEXT_PUBLIC_MAPS_API_KEY || null;
}
