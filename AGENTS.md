# Engineering notes

- Server logic uses TanStack Start server functions; external callers (payment webhooks) use routes under `src/routes/api/public/`, which verify the caller themselves — they bypass auth.
- Admin access is enforced server-side by an email allowlist in `src/lib/admin-guard.server.ts` mirrored by the `is_authorized_admin()` database function — keep both in sync.
- Money is stored as integer cents and the deposit split lives in `src/lib/money.ts` — one source of truth for pricing.
