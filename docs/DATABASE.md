# Database

Source of truth: `supabase/migrations/0001_foundation.sql`.

Apply it in the Supabase SQL editor (or `supabase db push` once the CLI is linked).

## Money

Every price, fee, tax, and total is **integer cents**. Formatting to CAD happens in `src/lib/money.ts`. Do not add floating-point money columns.

Tax is stored as **basis points** on `tax_settings.rate_bps` (1300 = 13%).

## Core tables

Generic names so future services do not need new “snow_*” tables.

- `profiles` — one per `auth.users`. Public signup inserts `CUSTOMER`.
- `properties` / `property_zones` / `property_photos` (`DRIVEWAY`, `DRIVEWAY_FINISHED` plus the original types). Properties also store `roof_type`, `roof_notes`, `salt_puck_count`, `firewood_preferences`, `firewood_stack_location`, and `firewood_notes`.
- `services` — catalog (`SNOW`, `FIREWOOD`, `FUTURE`)
- `service_requests` → `jobs` → `job_photos` / `job_materials`. Customers request visits. Admin approves, then dispatches a job and assigns crew. Crew proof lives on `job_photos` (`BEFORE` / `AFTER`).
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

The foundation migration seeds settings, Ontario HST, and three snow service catalog rows with `base_price = 0`. `0004_roof_pucks_and_firewood.sql` adds roof/firewood property fields, a Roof Salt Pucks service, and a real firewood product list. It does **not** invent customers, jobs, or paid orders.

## Storage

Private bucket `job-media`. Object-path rules tighten in Phase 5 when before/after uploads exist.
