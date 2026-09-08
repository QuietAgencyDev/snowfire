# Snow & Fire — Architecture

Snow & Fire is a Canadian property-service operating system. The first products are residential/commercial snow removal and firewood sales. The architecture is service-agnostic so landscaping, tree work, and other property services can be added later without rewriting customers, properties, jobs, photos, or payments.

**Product name:** Snow & Fire  
**Consumer brand:** SnowFire.ca (provided logo)  
**Repository:** [QuietAgencyDev/snowfire](https://github.com/QuietAgencyDev/snowfire)

---

## 1. Current repository assessment

Inspected `C:\Users\user\.cursor\snowfire` on 2026-09-07.

| Area | Status |
| --- | --- |
| Framework | None |
| Dependencies | None |
| Components | None |
| Database | None |
| Authentication | None |
| Environment files | None |
| Routes | None |
| Styling | None |
| Git | Empty `main`, remote `origin` → `https://github.com/QuietAgencyDev/snowfire.git` |
| Brand asset | SnowFire.ca logo supplied; not yet in the repo |

**Conflicts with this architecture:** none. This is a greenfield repository. Nothing to preserve or migrate.

---

## 2. Assumptions (documented, not blocking)

1. Market is Canada. Money is CAD. Addresses use `province` + postal code.
2. Monetary values are stored as **integer cents**. No floating-point money math.
3. Public signup creates a **CUSTOMER** only. CREW, ADMIN, and SUPER_ADMIN accounts are provisioned by an admin.
4. Default booking mode is **ADMIN_APPROVAL**. AUTO_CONFIRM is a system setting, not a hard-coded path.
5. Default timezone is `America/Toronto` until settings exist per business.
6. Email/password via Supabase Auth is the first auth method. Magic links and SMS can be added later.
7. Maps and weather are abstracted behind interfaces. No provider is wired until API keys exist.
8. The cartoon SnowFire.ca mark is the official logo. Surrounding UI stays dark charcoal, ice neutrals, and restrained fire accents — not clip-art chrome around the mark.
9. Crew offline-first is designed in (queued writes, cached jobs) but not fully implemented in Phase 1.

---

## 3. System shape

```text
CUSTOMER → PROPERTY → SERVICE → JOB → CREW → PHOTO → PAYMENT → HISTORY
```

**Property is the durable record.** Service history, contracts, photos, and orders stay on the property even if the customer account or service mix changes.

```text
┌────────────┐   ┌────────────┐   ┌────────────┐
│  Customer  │   │    Crew    │   │   Admin    │
│   Next.js  │   │   Next.js  │   │   Next.js  │
│  (mobile)  │   │  (phone)   │   │ (desktop)  │
└─────┬──────┘   └─────┬──────┘   └─────┬──────┘
      │                │                │
      └────────────────┼────────────────┘
                       ▼
              Next.js App Router
         Server Actions / Route Handlers
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     Supabase     Supabase     Stripe
     Auth+RLS     Storage      Payments
     Postgres
```

---

## 4. Technology stack

| Layer | Choice | Why |
| --- | --- | --- |
| App | Next.js App Router, TypeScript | Specified. Server Components + server actions keep secrets off the client. |
| UI | Tailwind CSS, shadcn/ui, Lucide | Specified. Accessible primitives, no custom design-system build. |
| Data | Supabase Postgres + RLS | Specified. Authorization lives in the database, not only in UI. |
| Auth | Supabase Auth (`@supabase/ssr`) | Cookie session on the server. Service role never shipped to the browser. |
| Files | Supabase Storage | Job/property photos with signed URLs and typed metadata. |
| Payments | Stripe (test mode first) | PaymentIntents, later invoices/subscriptions. No raw card data stored. |
| Validation | Zod | Every inbound payload. |
| Money | Integer cents + dedicated helpers | Safe CAD math. |

No extra libraries unless a phase requires them (maps, email, image processing).

---

## 5. Domain model

Generic nouns only. A snow clearing and a future lawn job are both `jobs` with `services.category`.

### 5.1 Core entities

- **profiles** — one row per auth user. `role`: `CUSTOMER` | `CREW` | `ADMIN` | `SUPER_ADMIN`.
- **properties** — belongs to a customer. Residential or commercial. Driveway, hazards, snow storage, instructions live here.
- **property_zones** — commercial service areas (parking lot, sidewalk, loading dock). Present in schema from the start so commercial work does not force a rewrite.
- **property_photos** — property-level photos (`PROPERTY`, `DAMAGE`, `OTHER`).
- **services** — catalog. `category`: `SNOW` | `FIREWOOD` | `FUTURE`. `pricing_model`: `FIXED` | `PER_EVENT` | `PER_CM` | `SEASONAL` | `CUSTOM_QUOTE`.
- **service_requests** — customer booking/request before it becomes a job.
- **jobs** — executable work against a property + service. Status machine below.
- **job_photos** — `BEFORE` | `AFTER` | `DAMAGE` | `OTHER` with timestamp, crew, optional GPS.
- **job_materials** — salt, ice melt, sand, etc.
- **contracts** — seasonal / monthly / commercial agreements.
- **invoices** / **payments** — billing, Stripe IDs, status. Amounts in cents.
- **firewood_products** / **firewood_orders** / **firewood_order_items** — sellable catalog + fulfillment, not a fake “service job.”
- **storm_events** — operational envelope that can spawn many jobs.
- **audit_logs** — who changed what, on which entity.
- **notifications** — typed events; email first, SMS/push later.
- **system_settings** — booking mode, tax, feature flags. Not hard-coded in React.

### 5.2 Job status machine

```text
UNASSIGNED → ASSIGNED → EN_ROUTE → ARRIVED → IN_PROGRESS → COMPLETED
                 ↘ CANCELLED / FAILED
```

Crew path (vertical slice):

1. View job (property, hazards, instructions, map link)
2. Navigate (device maps)
3. Arrived → `arrival_time`
4. Take **BEFORE** photo (primary action, not a generic upload)
5. Start job → `start_time`
6. Record work / materials / notes
7. Take **AFTER** photo
8. Complete → `completion_time`
9. Customer notified with proof

### 5.3 Booking modes

`system_settings.booking_mode`:

- `ADMIN_APPROVAL` (default) — request stays in `ADMIN_REVIEW` until an admin approves and converts to a job.
- `AUTO_CONFIRM` — approved request can convert to a job immediately.

### 5.4 Money and tax

- All prices, fees, tax, and totals: `integer` cents.
- Tax is configurable (`tax_name`, `rate_bps`, `province`). No scattered `0.13` literals.
- Pricing is a server-side service. UI only displays quoted amounts.

---

## 6. Authorization

Never trust a client-side role check alone.

| Role | Can see / do |
| --- | --- |
| CUSTOMER | Own profile, properties, requests, jobs, photos, orders, invoices |
| CREW | Assigned jobs + the property/customer fields required to execute them |
| ADMIN | Business operations across customers, jobs, crew, catalog, billing |
| SUPER_ADMIN | Admin plus roles, settings, audit, diagnostics, feature flags |

Enforcement layers:

1. Supabase RLS on every table
2. Server actions / route handlers re-check session + role
3. Storage policies scoped by photo type and job assignment

The Supabase **service role key** is server-only (migrations, privileged admin tasks, webhooks). It is never prefixed with `NEXT_PUBLIC_`.

---

## 7. Application surfaces

Purpose-built layouts, not one desktop UI shrunk down.

| Surface | Route prefix | Device | Purpose |
| --- | --- | --- | --- |
| Marketing | `/` | All | Brand, sign in, create account |
| Auth | `/login`, `/signup` | All | Customer self-serve; others invited |
| Customer | `/customer/*` | Mobile-first | Properties, book, history, firewood, invoices |
| Crew | `/crew/*` | Phone, gloves, sun | Huge buttons, job lifecycle, camera |
| Admin | `/admin/*` | Desktop / tablet | Dispatch, customers, storms, money |

Middleware sends authenticated users to their role home. Unauthenticated users hitting app routes go to `/login`.

---

## 8. API and services

Prefer Next.js **server actions** for UI mutations. Use **route handlers** for webhooks (Stripe) and anything a non-browser client must call.

Logical groups (implemented as they are needed, not as empty stubs):

- `properties`, `services`, `bookings`, `jobs` (+ arrive / start / complete / photos)
- `firewood/products`, `firewood/orders`
- `payments`, `invoices`, `storms`, `notifications`

Server modules (not React components):

- `auth` — session, role gate
- `pricing` — quote a service against a property
- `money` — cents arithmetic, CAD formatting
- `photos` — storage paths, signed upload, metadata
- `weather` — interface only until a provider is configured
- `notifications` — typed dispatch
- `audit` — write-only log helper

Zod schemas live next to the action they protect.

---

## 9. Storage

Private bucket `job-media` (and later `documents`).

Object key pattern:

```text
properties/{property_id}/{photo_type}/{uuid}.jpg
jobs/{job_id}/{photo_type}/{uuid}.jpg
```

Metadata in Postgres: who, when, type, optional lat/lng. The browser receives short-lived signed URLs only.

---

## 10. Payments (designed now, wired in Phase 6)

- Stripe Payment Element / hosted checkout for one-time jobs and firewood.
- Later: deposits, invoices, seasonal subscriptions, refunds.
- `payments.stripe_payment_intent_id` and `invoices.stripe_invoice_id` are the join keys.
- Webhook handler is the source of truth for payment status. The UI never claims “paid” without Stripe confirmation.

---

## 11. Notifications and weather

Notification rows are written for every meaningful event (`JOB_COMPLETED`, `BOOKING_RECEIVED`, …). Phase 1 stores them. Email sending starts when a provider is configured. SMS/push are the same table, different channel.

`WeatherService` is an interface (`getForecast`, `getObservedSnowfall`). Jobs may store a `weather_snapshot` JSON blob. Weather never auto-charges a customer.

---

## 12. Design system

- **Logo:** `/public/brand/snowfire-logo.png` via a single `BrandLogo` component (header, auth, reports).
- **Palette:** charcoal `#1C1917`, ice `#F4F6F8`, snow white, ember `#C2410C` used sparingly.
- **Type:** system / Geist — high readability outdoors.
- **Crew:** 48px+ tap targets, high contrast, one primary action per screen.
- **Motion:** minimal. Status is text + badge, not color alone.

---

## 13. Observability

- Application errors: structured server logs. No stack traces to customers.
- Audit log for assignments, status changes, photos, money, admin edits.
- User-facing errors are generic and recoverable (“Unable to complete this booking right now.”).

---

## 14. What Phase 1 will and will not do

**Will:** app shell, env, Supabase clients, full first-pass schema + RLS, email auth, role routing, branded layouts, error/loading states.

**Will not:** fake bookings, fake GPS, fake weather, pretend payments, or clickable job buttons that write nothing. Unbuilt product areas are labeled Coming soon or omitted until their phase.
