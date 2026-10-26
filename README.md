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
| `RESEND_API_KEY` | server only | Resend API key used by contact and partner enquiry forms |
| `EMAIL_FROM` | server only | Sender address verified with Resend |
| `CONTACT_EMAIL` | server only | Enquiry destination (defaults to `contact@horizonboatcharters.com`) |

Never commit real credentials.

### Enquiry and partner application email setup

The contact form and boat partner application send through Resend from TanStack Start server functions. Add `RESEND_API_KEY` and `EMAIL_FROM` to your local `.env` and production server environment; set `CONTACT_EMAIL` to `contact@horizonboatcharters.com` if you want to override the built-in recipient. Verify the sender domain/address in Resend and configure the DNS records Resend provides before sending. Applicant addresses are set as `Reply-To`; they are never used as the sender. Both forms include a honeypot and a best-effort per-server-instance rate limit, so production abuse protection across Cloudflare instances should use a shared rate limiter or CAPTCHA if spam becomes an issue.

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
