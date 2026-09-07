# Security

## Authorization layers

1. Supabase Auth session (cookie, refreshed in `src/proxy.ts`)
2. Role routing: `/customer`, `/crew`, `/admin`
3. Row Level Security on every public table
4. Server actions re-read the session and must not trust the UI

Client-side role badges are display only.

## Data rules

- Customers see only their own profile, properties, requests, jobs, orders, and invoices.
- Crew see only jobs where `assigned_crew_id` is their profile, plus fields needed to do the work.
- Admins and super admins have elevated SQL policies.
- Users cannot change their own `role` through the self-update policy.

## Secrets

- `SUPABASE_SERVICE_ROLE_KEY` is imported only in `src/lib/supabase/admin.ts`.
- No service role usage in Client Components.
- Stripe keys are unused until Phase 6. Do not put test charges in the UI before then.

## Errors

User-facing copy is generic. Database errors, stack traces, and provider messages are not shown to customers.

## Photos

The `job-media` bucket is private. Phase 5 will scope objects to job/property paths and signed URLs. Do not make the bucket public.
