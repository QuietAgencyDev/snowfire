alter table public.properties
  add column if not exists service_preferences jsonb not null default '[]'::jsonb;
