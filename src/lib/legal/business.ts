// The facts the legal pages state about who is behind the site. They live here
// because a privacy policy that contradicts itself between pages is worse than
// one that is merely brief.
//
// CONFIRM BEFORE RELYING ON THESE: the operating name below is the brand, not a
// registered legal entity, and CONTACT_EMAIL must be an address that actually
// receives mail. snowfire.ca has no MX records today, so an @snowfire.ca address
// would silently bounce — and a privacy contact nobody can reach defeats the
// point of publishing one.
export const BUSINESS = {
  name: "SnowFire.ca",
  contactEmail: "slabcentraltv@gmail.com",
  region: "Ontario, Canada",
  serviceArea: "the Barrie and Greater Toronto area",
} as const;

// Shown to readers so they can tell whether they are looking at current terms.
export const LEGAL_UPDATED = "September 20, 2026";
