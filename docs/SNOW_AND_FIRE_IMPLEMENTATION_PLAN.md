# Snow & Fire — Implementation Plan

Executable phases. Do not start the next phase until the current one is functioning.

Related: [SNOW_AND_FIRE_ARCHITECTURE.md](./SNOW_AND_FIRE_ARCHITECTURE.md)

---

## Repository state (start)

Greenfield. No framework, database, or auth. Logo supplied by the owner; will land in `public/brand/` during Phase 1.

No architectural conflicts.

---

## Phase 1 — Foundation

**Done when:** `npm run dev` boots a branded Next.js app; env is documented; schema + RLS SQL exists; a user can sign up / sign in as CUSTOMER when Supabase is configured; middleware routes by role; unauthenticated app routes redirect; error and loading states exist; service-role key is server-only.

Build:

1. Next.js (App Router) + TypeScript + Tailwind + ESLint
2. shadcn/ui + Lucide
3. Brand logo component and marketing/auth chrome
4. `.env.example` and server/browser Supabase clients
5. SQL migrations: enums, tables from the architecture, RLS, storage bucket policies
6. Auth: email/password, session cookies, `profiles` row on signup (`CUSTOMER`)
7. Role layouts: `/customer`, `/crew`, `/admin` (empty-but-honest shells)
8. Global error / not-found / loading
9. Docs: README, environment, database, security, roadmap, deployment

**Out of scope:** bookings, jobs, Stripe, firewood checkout, maps, weather providers.

**Tests:** env schema validation; role helper unit tests; “unauthenticated user cannot open `/customer`” when middleware can be tested.

---

## Phase 2 — Customer + property

**Done when:** a signed-in customer can add, edit, and view a property (address, type, driveway, hazards, snow storage, notes) and see an empty-state dashboard that does not invent jobs.

Build: customer dashboard, profile, property CRUD, property photos (if storage is configured), service catalog browse (read-only from `services`).

**Tests:** customer A cannot read customer B’s property (RLS + server action).

---

## Phase 3 — Booking

**Done when:** customer selects property + snow service + date, submits a `service_request`; admin sees it; approval/decline works; `ADMIN_APPROVAL` vs `AUTO_CONFIRM` is honored; price comes from the pricing service (even if rules are simple).

**Tests:** Zod rejection of bad dates; request cannot be created for someone else’s property.

---

## Phase 4 — Crew job system (critical)

**Done when:** admin converts an approved request to a job, assigns crew; crew can Assigned → En route → Arrived → Before → Start → Work → After → Complete on a phone-sized layout.

**Tests:** crew cannot open an unassigned job; status transitions only move forward along the allowed graph.

---

## Phase 5 — Before / after proof

**Done when:** before/after are required, timestamped, stored privately, and shown in a comparison viewer on customer history. No generic “upload anything” as the primary crew action.

**Tests:** photo type and job ownership enforced in storage + RLS.

---

## Phase 6 — Payments

**Done when:** Stripe test mode can take a one-time payment; webhook updates `payments` / `invoices`; UI never shows paid without Stripe.

**Tests:** webhook signature required; failed payment stays failed.

---

## Phase 7 — Firewood

**Done when:** admin manages products/inventory; customer orders against a property; statuses move PENDING → … → DELIVERED; inventory decrements on confirm.

**Tests:** cannot oversell inventory; customer cannot see another customer’s order.

---

## Phase 8 — Storm operations

**Done when:** admin creates a storm event and can generate jobs for contracted/eligible properties; operations dashboard shows counts. No automatic charging from weather.

---

## Phase 9 — Commercial

**Done when:** commercial properties have zones; jobs can target a zone; a completed commercial job can produce a branded service report PDF/page.

---

## Phase 10 — Optimization

Only after the vertical slice is real:

Route optimization, SMS/push, weather automation, analytics, recurring billing, inventory forecasting.

---

## Vertical slice (heart of the product)

This is the quality bar. Later phases must not break it.

1. Customer creates account  
2. Customer adds property  
3. Customer books snow removal  
4. Admin sees booking  
5. Admin assigns crew  
6. Crew opens job  
7. Crew arrives  
8. Crew takes BEFORE photo  
9. Crew starts job  
10. Crew completes work  
11. Crew takes AFTER photo  
12. Crew completes job  
13. Customer sees completion + before/after  

Phase mapping: 1 (auth) → 2 (property) → 3 (book) → 4–5 (crew + photos). Payments and firewood come after this slice works.

---

## Build order (checklist)

1. Inspect repository — done  
2. Architecture + this plan — this document  
3. Database schema SQL  
4. Supabase migrations + RLS  
5. Authentication  
6. Role-based layouts  
7. Customer properties  
8. Services  
9. Booking  
10. Admin job management  
11. Crew job workflow  
12. Photo system  
13. Service history  
14. Stripe  
15. Firewood  
16. Storms  
17. Commercial  
18. Testing + hardening  

---

## Definition of “functioning”

A phase is not done if:

- A button looks live but writes nothing  
- A payment, GPS point, weather reading, or inventory number is fabricated  
- A customer or crew can see another principal’s data  
- The app cannot boot without undocumented secrets  

Unfinished features are omitted or marked **Coming soon**.
