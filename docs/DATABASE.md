# Database

Source of truth: `supabase/migrations/0001_foundation.sql`.

Apply it in the Supabase SQL editor (or `supabase db push` once the CLI is linked).

## Money

Every price, fee, tax, and total is **integer cents**. Formatting to CAD happens in `src/lib/money.ts`. Do not add floating-point money columns.

Tax is stored as **basis points** on `tax_settings.rate_bps` (1300 = 13%).

## Core tables

Generic names so future services do not need new “snow_*” tables.

- `profiles` — one per `auth.users`. Public signup inserts `CUSTOMER`.
- `properties` / `property_zones` / `property_photos`
- `services` — catalog (`SNOW`, `FIREWOOD`, `FUTURE`)
- `service_requests` → `jobs` → `job_photos` / `job_materials`
- `contracts`, `invoices`, `payments`
- `firewood_products`, `firewood_orders`, `firewood_order_items`
- `storm_events`
- `system_settings` — singleton; default booking mode `ADMIN_APPROVAL`
- `tax_settings`, `pricing_rules`
- `notifications`, `audit_logs`

## Auth trigger

`handle_new_user` copies `first_name`, `last_name`, and `phone` from user metadata into `profiles`.

Crew / admin roles are not self-serve. Promote a profile in SQL or a later admin tool:

```sql
update public.profiles
set role = 'ADMIN'
where email = 'owner@example.com';
```

## Seed

The migration seeds settings, Ontario HST, and three snow service catalog rows with `base_price = 0` (`CUSTOM_QUOTE` / seasonal / per-event). It does **not** invent customers, jobs, or inventory.

## Storage

Private bucket `job-media`. Object-path rules tighten in Phase 5 when before/after uploads exist.
