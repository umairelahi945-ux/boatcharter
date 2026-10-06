# Boat Charter

Luxury yacht and boat charter web application: customer storefront, online booking with a 20% deposit, and an administrator dashboard for yachts, bookings, payments and financial records.

## Tech stack

- TanStack Start (React 19, file-based routing, server functions) on Vite
- TypeScript, Tailwind CSS v4, shadcn/ui
- Supabase (PostgreSQL, Row Level Security, authentication)
- Deploys to Cloudflare Workers

## Requirements

- Node.js 20+ and [Bun](https://bun.sh) (npm also works)
- A Supabase project

## Setup

```sh
git clone <repository-url>
cd boat-charter
bun install
cp .env.example .env   # then fill in the values below
bun run dev            # http://localhost:8080
```

## Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` / `SUPABASE_URL` | browser / server | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY` | browser / server | Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Privileged server operations |
| `PAYMENT_PROVIDER`, `PAYMENT_SECRET_KEY`, `PAYMENT_API_URL`, `PAYMENT_WEBHOOK_SECRET`, ... | server only | Payment gateway (see `.env.example`) |

Never commit real credentials.

## Database

SQL migrations live in `supabase/migrations/`. Apply them to your Supabase project with the Supabase CLI:

```sh
supabase link --project-ref <ref>
supabase db push
```

Enable Email and Google providers in Supabase Auth. Admin access is restricted to the allowlist in `src/lib/admin-guard.server.ts` and the `is_authorized_admin()` database function.

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start the development server |
| `bun run build` | Production build |
| `bun run preview` | Preview the production build |
| `bun run lint` | Run ESLint |
| `bun run format` | Format with Prettier |

## Deployment

`bun run build` outputs a Cloudflare Workers bundle. Deploy with Wrangler (or any Workers-compatible host), set the environment variables above, and register the payment webhook at `POST https://<your-domain>/api/public/webhooks/payment`.
