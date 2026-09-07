# Snow & Fire

Property-service operations for residential and commercial snow removal, plus firewood sales. The durable record is the **property**.

Consumer brand: **SnowFire Online**.

## Status

Phase 1 — Foundation is in progress:

- Next.js App Router, TypeScript, Tailwind, shadcn/ui
- Branded marketing, login, and role shells
- Supabase schema + RLS SQL
- Auth wired when environment variables are present

Properties, booking, crew jobs, photos, Stripe, and firewood checkout are **not built yet**. Those screens are labeled Coming soon.

## Local run

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Sign-in stays disabled until Supabase keys are in `.env.local` and `supabase/migrations/0001_foundation.sql` has been applied.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
- `npm test` — role and money unit tests

## Docs

- [Architecture](docs/SNOW_AND_FIRE_ARCHITECTURE.md)
- [Implementation plan](docs/SNOW_AND_FIRE_IMPLEMENTATION_PLAN.md)
- [Environment](docs/ENVIRONMENT.md)
- [Database](docs/DATABASE.md)
- [Security](docs/SECURITY.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Roadmap](docs/ROADMAP.md)
