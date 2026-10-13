/**
 * Server-side administrator allowlist.
 *
 * This is the single source of truth for admin authorization. It is never
 * shipped to the browser (`.server.ts` files are excluded from client bundles)
 * and every privileged server function must call `assertAdmin` before touching
 * data. The same allowlist is mirrored in the database through the
 * `public.is_authorized_admin()` function used by the row-level policies.
 */
const ADMIN_EMAILS = new Set([
  "hibasaratechservices@gmail.com",
  "umairelahi945@gmail.com",
  "umairlelahi945@gmail.com",
  "ibrar@horizonboatcharters.com",
  "sam@horizonboatcharters.com",
  "contact@horizonboatcharters.com",
]);

export function isAdminEmail(email: unknown): boolean {
  return typeof email === "string" && ADMIN_EMAILS.has(email.trim().toLowerCase());
}

type Claims = { email?: unknown } | null | undefined;

/** Verifies the authenticated caller is on the administrator allowlist. */
export function assertAdmin(claims: Claims): string {
  const email = typeof claims?.email === "string" ? claims.email.trim().toLowerCase() : "";
  if (!isAdminEmail(email)) {
    throw new Error("Access denied. This account is not authorized to access the administrator dashboard.");
  }
  return email;
}
