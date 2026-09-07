# Deployment

The app is a standard Next.js App Router project.

## Before go-live

1. Production Supabase project
2. Apply `supabase/migrations/0001_foundation.sql`
3. Set environment variables on the host (see `docs/ENVIRONMENT.md`)
4. `NEXT_PUBLIC_SITE_URL` must match the public origin
5. `npm run build` must pass
6. Confirm email templates point at `/auth/callback`

## Suggested host

Vercel or any Node host that supports Next.js 16. Proxy (`src/proxy.ts`) must run — do not use a static export.

## What is not deployable as a business yet

Booking, crew job execution, photos, Stripe, and firewood checkout. Deploying Phase 1 is useful for auth and branded shells only.
