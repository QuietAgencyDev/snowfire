# Environment

Copy `.env.example` to `.env.local`. Never commit real keys.

| Variable | Where it is used | Phase |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server Supabase client | 1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server Supabase client | 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin client (`src/lib/supabase/admin.ts`) | 1+ |
| `NEXT_PUBLIC_SITE_URL` | Auth email redirect origin | 1 |
| `STRIPE_SECRET_KEY` | Server Stripe | 6 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe.js | 6 |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook route | 6 |
| `MAPS_API_KEY` | Optional Google Maps embed/geocode. Address embed works without it. | 2 |
| `WEATHER_API_KEY` | Unused. Local weather uses Open-Meteo against the property pin. | 2 |

## Rules

- Anything starting with `NEXT_PUBLIC_` is visible in the browser.
- The service role key must **never** be `NEXT_PUBLIC_`.
- The app boots without secrets. Auth forms explain that Supabase is not configured instead of pretending login works.

## Configure Supabase

1. Create a project.
2. Put the project URL and anon key in `.env.local`.
3. Keep the service role key server-only.
4. In the SQL editor, run `supabase/migrations/0001_foundation.sql`.
5. Enable Email auth. Public signup creates `CUSTOMER` profiles only.
6. Enable Google and Apple providers under Authentication → Providers.
7. Add `http://localhost:3000/auth/callback` (and the production origin) to Redirect URLs.

Google needs a Web client ID and secret from Google Cloud. Apple needs a Services ID, Team ID, Key ID, and private key from Apple Developer. Until those providers are turned on, the Google and Apple buttons will fail with a real error instead of a fake login.
