// Where an auth link asked to continue, accepted only if it stays on this site.
//
// The value arrives in a URL that we mail to people, so it has to be treated as
// hostile. A bare startsWith("/") check is not enough: "//evil.example" is a
// protocol-relative URL and would leave the origin entirely, which is how a
// password-reset link turns into a phishing redirect. Backslashes are refused
// because some clients normalise them to forward slashes, and a colon is refused
// so nothing scheme-like ("/\t javascript:...") survives.
export function internalPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value.includes("\\") || value.includes(":") ? null : value;
}
