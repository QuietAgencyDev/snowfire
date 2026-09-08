-- Snow & Fire foundation schema.
-- Monetary columns are integer cents CAD unless a comment says otherwise.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.user_role as enum ('CUSTOMER', 'CREW', 'ADMIN', 'SUPER_ADMIN');
create type public.property_type as enum ('RESIDENTIAL', 'COMMERCIAL');
create type public.service_category as enum ('SNOW', 'FIREWOOD', 'FUTURE');
create type public.pricing_model as enum ('FIXED', 'PER_EVENT', 'PER_CM', 'SEASONAL', 'CUSTOM_QUOTE');
create type public.service_request_status as enum (
  'CUSTOMER_REQUESTED',
  'ADMIN_REVIEW',
  'APPROVED',
  'DECLINED',
  'CANCELLED',
  'CONVERTED_TO_JOB'
);
create type public.job_status as enum (
  'UNASSIGNED',
  'ASSIGNED',
  'EN_ROUTE',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'FAILED'
);
create type public.job_priority as enum ('NORMAL', 'HIGH', 'URGENT');
create type public.photo_type as enum ('BEFORE', 'AFTER', 'PROPERTY', 'DAMAGE', 'OTHER');
create type public.contract_type as enum ('SEASONAL', 'MONTHLY', 'COMMERCIAL', 'CUSTOM');
create type public.contract_status as enum ('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED');
create type public.invoice_status as enum ('DRAFT', 'OPEN', 'PAID', 'VOID', 'OVERDUE');
create type public.payment_status as enum ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');
create type public.firewood_order_status as enum (
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED'
);
create type public.storm_status as enum ('MONITORING', 'ACTIVE', 'PROCESSING', 'COMPLETED');
create type public.booking_mode as enum ('ADMIN_APPROVAL', 'AUTO_CONFIRM');
create type public.notification_type as enum (
  'BOOKING_RECEIVED',
  'BOOKING_APPROVED',
  'BOOKING_DECLINED',
  'CREW_ASSIGNED',
  'CREW_EN_ROUTE',
  'CREW_ARRIVED',
  'JOB_STARTED',
  'JOB_COMPLETED',
  'INVOICE_CREATED',
  'PAYMENT_RECEIVED',
  'PAYMENT_FAILED',
  'FIREWOOD_ORDER_RECEIVED',
  'FIREWOOD_OUT_FOR_DELIVERY',
  'FIREWOOD_DELIVERED'
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profile helper functions are created after public.profiles exists.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  email text not null,
  role public.user_role not null default 'CUSTOMER',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  name text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  province text not null,
  postal_code text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  property_type public.property_type not null default 'RESIDENTIAL',
  driveway_type text,
  driveway_length numeric(8, 2),
  driveway_width numeric(8, 2),
  parking_area text,
  walkway_count integer not null default 0,
  steps_count integer not null default 0,
  snow_storage_location text,
  deicing_required boolean not null default false,
  hazards text,
  special_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_zones (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  priority public.job_priority not null default 'NORMAL',
  instructions text,
  photo_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  storage_path text not null,
  photo_type public.photo_type not null default 'PROPERTY',
  caption text,
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category public.service_category not null,
  service_type text not null,
  active boolean not null default true,
  base_price integer not null default 0,
  pricing_model public.pricing_model not null default 'FIXED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_base_price_cents check (base_price >= 0)
);

comment on column public.services.base_price is 'Integer cents CAD.';

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  property_id uuid not null references public.properties (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  requested_date date not null,
  preferred_time text,
  status public.service_request_status not null default 'CUSTOMER_REQUESTED',
  customer_notes text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete restrict,
  customer_id uuid not null references public.profiles (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  assigned_crew_id uuid references public.profiles (id) on delete set null,
  property_zone_id uuid references public.property_zones (id) on delete set null,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  status public.job_status not null default 'UNASSIGNED',
  priority public.job_priority not null default 'NORMAL',
  before_photo_required boolean not null default true,
  after_photo_required boolean not null default true,
  arrival_time timestamptz,
  start_time timestamptz,
  completion_time timestamptz,
  crew_notes text,
  customer_notes text,
  weather_snapshot jsonb,
  snow_depth numeric(6, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete restrict,
  uploaded_by uuid references public.profiles (id) on delete set null,
  photo_type public.photo_type not null,
  storage_path text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.job_materials (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  material_name text not null,
  quantity numeric(10, 2) not null,
  unit text not null,
  cost integer not null default 0,
  created_at timestamptz not null default now(),
  constraint job_materials_cost_cents check (cost >= 0)
);

comment on column public.job_materials.cost is 'Integer cents CAD.';

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  property_id uuid not null references public.properties (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  contract_type public.contract_type not null,
  start_date date not null,
  end_date date,
  status public.contract_status not null default 'DRAFT',
  price integer not null default 0,
  billing_frequency text,
  terms text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contracts_price_cents check (price >= 0)
);

comment on column public.contracts.price is 'Integer cents CAD.';

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  property_id uuid references public.properties (id) on delete set null,
  job_id uuid references public.jobs (id) on delete set null,
  contract_id uuid references public.contracts (id) on delete set null,
  invoice_number text not null unique,
  subtotal integer not null default 0,
  tax integer not null default 0,
  total integer not null default 0,
  status public.invoice_status not null default 'DRAFT',
  stripe_invoice_id text,
  due_date date,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_money_cents check (subtotal >= 0 and tax >= 0 and total >= 0)
);

comment on column public.invoices.subtotal is 'Integer cents CAD.';
comment on column public.invoices.tax is 'Integer cents CAD.';
comment on column public.invoices.total is 'Integer cents CAD.';

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  invoice_id uuid references public.invoices (id) on delete set null,
  stripe_payment_intent_id text,
  amount integer not null,
  currency text not null default 'cad',
  status public.payment_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  constraint payments_amount_cents check (amount >= 0)
);

comment on column public.payments.amount is 'Integer cents.';

create table public.firewood_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  wood_type text,
  seasoned boolean not null default false,
  kiln_dried boolean not null default false,
  quantity_unit text not null,
  price integer not null,
  inventory_quantity integer not null default 0,
  delivery_available boolean not null default true,
  pickup_available boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint firewood_products_price_cents check (price >= 0)
);

comment on column public.firewood_products.price is 'Integer cents CAD.';

create table public.firewood_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  property_id uuid not null references public.properties (id) on delete restrict,
  status public.firewood_order_status not null default 'PENDING',
  delivery_date date,
  delivery_notes text,
  subtotal integer not null default 0,
  delivery_fee integer not null default 0,
  tax integer not null default 0,
  total integer not null default 0,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint firewood_orders_money_cents check (
    subtotal >= 0 and delivery_fee >= 0 and tax >= 0 and total >= 0
  )
);

create table public.firewood_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.firewood_orders (id) on delete cascade,
  product_id uuid not null references public.firewood_products (id) on delete restrict,
  quantity integer not null,
  unit_price integer not null,
  total integer not null,
  constraint firewood_order_items_money_cents check (
    quantity > 0 and unit_price >= 0 and total >= 0
  )
);

create table public.storm_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_time timestamptz not null,
  end_time timestamptz,
  estimated_snowfall numeric(6, 2),
  actual_snowfall numeric(6, 2),
  status public.storm_status not null default 'MONITORING',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.system_settings (
  id smallint primary key default 1 check (id = 1),
  booking_mode public.booking_mode not null default 'ADMIN_APPROVAL',
  timezone text not null default 'America/Toronto',
  business_name text not null default 'Snow & Fire',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tax_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rate_bps integer not null,
  province text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tax_settings_rate_bps check (rate_bps >= 0)
);

comment on column public.tax_settings.rate_bps is 'Tax rate in basis points. 1300 = 13%.';

create table public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services (id) on delete cascade,
  property_type public.property_type,
  rule_key text not null,
  amount integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.pricing_rules.amount is 'Integer cents CAD adjustment or base.';

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where user_id = auth.uid()
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where user_id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('ADMIN', 'SUPER_ADMIN')
$$;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index profiles_role_idx on public.profiles (role);
create index properties_customer_id_idx on public.properties (customer_id);
create index property_zones_property_id_idx on public.property_zones (property_id);
create index service_requests_customer_id_idx on public.service_requests (customer_id);
create index service_requests_status_idx on public.service_requests (status);
create index jobs_customer_id_idx on public.jobs (customer_id);
create index jobs_assigned_crew_id_idx on public.jobs (assigned_crew_id);
create index jobs_status_idx on public.jobs (status);
create index jobs_property_id_idx on public.jobs (property_id);
create index job_photos_job_id_idx on public.job_photos (job_id);
create index invoices_customer_id_idx on public.invoices (customer_id);
create index payments_customer_id_idx on public.payments (customer_id);
create index firewood_orders_customer_id_idx on public.firewood_orders (customer_id);
create index notifications_user_id_idx on public.notifications (user_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger properties_updated_at before update on public.properties
  for each row execute function public.set_updated_at();
create trigger property_zones_updated_at before update on public.property_zones
  for each row execute function public.set_updated_at();
create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();
create trigger service_requests_updated_at before update on public.service_requests
  for each row execute function public.set_updated_at();
create trigger jobs_updated_at before update on public.jobs
  for each row execute function public.set_updated_at();
create trigger contracts_updated_at before update on public.contracts
  for each row execute function public.set_updated_at();
create trigger invoices_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();
create trigger firewood_products_updated_at before update on public.firewood_products
  for each row execute function public.set_updated_at();
create trigger firewood_orders_updated_at before update on public.firewood_orders
  for each row execute function public.set_updated_at();
create trigger storm_events_updated_at before update on public.storm_events
  for each row execute function public.set_updated_at();
create trigger system_settings_updated_at before update on public.system_settings
  for each row execute function public.set_updated_at();
create trigger tax_settings_updated_at before update on public.tax_settings
  for each row execute function public.set_updated_at();
create trigger pricing_rules_updated_at before update on public.pricing_rules
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth: new users become CUSTOMER profiles
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, role, first_name, last_name, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    'CUSTOMER',
    coalesce(
      new.raw_user_meta_data ->> 'first_name',
      new.raw_user_meta_data ->> 'given_name',
      split_part(coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', ''), ' ', 1),
      ''
    ),
    coalesce(
      new.raw_user_meta_data ->> 'last_name',
      new.raw_user_meta_data ->> 'family_name',
      nullif(split_part(coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', ''), ' ', 2), ''),
      ''
    ),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Seed settings (not customer data)
-- ---------------------------------------------------------------------------

insert into public.system_settings (id, booking_mode, timezone, business_name)
values (1, 'ADMIN_APPROVAL', 'America/Toronto', 'Snow & Fire');

insert into public.tax_settings (name, rate_bps, province, active)
values ('HST', 1300, 'ON', true);

insert into public.services (name, description, category, service_type, active, base_price, pricing_model)
values
  ('One-Time Snow Removal', 'Single driveway and walkway clearing.', 'SNOW', 'ONE_TIME', true, 0, 'CUSTOM_QUOTE'),
  ('Seasonal Snow Contract', 'Seasonal agreement for qualifying snowfall.', 'SNOW', 'SEASONAL', true, 0, 'SEASONAL'),
  ('Per-Storm Service', 'Billed per qualifying storm event.', 'SNOW', 'PER_STORM', true, 0, 'PER_EVENT');

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_zones enable row level security;
alter table public.property_photos enable row level security;
alter table public.services enable row level security;
alter table public.service_requests enable row level security;
alter table public.jobs enable row level security;
alter table public.job_photos enable row level security;
alter table public.job_materials enable row level security;
alter table public.contracts enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.firewood_products enable row level security;
alter table public.firewood_orders enable row level security;
alter table public.firewood_order_items enable row level security;
alter table public.storm_events enable row level security;
alter table public.system_settings enable row level security;
alter table public.tax_settings enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_own_or_admin on public.profiles
  for select using (user_id = auth.uid() or public.is_admin());

create policy profiles_update_own on public.profiles
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and role = public.current_user_role());

create policy profiles_update_admin on public.profiles
  for update using (public.is_admin())
  with check (public.is_admin());

create policy properties_select on public.properties
  for select using (customer_id = public.current_profile_id() or public.is_admin());

create policy properties_write_own on public.properties
  for all using (customer_id = public.current_profile_id() or public.is_admin())
  with check (customer_id = public.current_profile_id() or public.is_admin());

create policy property_zones_access on public.property_zones
  for all using (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and (p.customer_id = public.current_profile_id() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and (p.customer_id = public.current_profile_id() or public.is_admin())
    )
  );

create policy property_photos_access on public.property_photos
  for all using (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and (p.customer_id = public.current_profile_id() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and (p.customer_id = public.current_profile_id() or public.is_admin())
    )
  );

create policy services_select_active on public.services
  for select using (active = true or public.is_admin());

create policy services_admin_write on public.services
  for all using (public.is_admin())
  with check (public.is_admin());

create policy service_requests_select on public.service_requests
  for select using (customer_id = public.current_profile_id() or public.is_admin());

create policy service_requests_insert_own on public.service_requests
  for insert with check (customer_id = public.current_profile_id() or public.is_admin());

create policy service_requests_update on public.service_requests
  for update using (customer_id = public.current_profile_id() or public.is_admin())
  with check (customer_id = public.current_profile_id() or public.is_admin());

create policy jobs_select on public.jobs
  for select using (
    customer_id = public.current_profile_id()
    or assigned_crew_id = public.current_profile_id()
    or public.is_admin()
  );

create policy jobs_admin_write on public.jobs
  for all using (public.is_admin())
  with check (public.is_admin());

create policy jobs_crew_update_assigned on public.jobs
  for update using (assigned_crew_id = public.current_profile_id())
  with check (assigned_crew_id = public.current_profile_id());

create policy job_photos_select on public.job_photos
  for select using (
    exists (
      select 1 from public.jobs j
      where j.id = job_id
        and (
          j.customer_id = public.current_profile_id()
          or j.assigned_crew_id = public.current_profile_id()
          or public.is_admin()
        )
    )
  );

create policy job_photos_write_crew_admin on public.job_photos
  for insert with check (
    public.is_admin()
    or exists (
      select 1 from public.jobs j
      where j.id = job_id and j.assigned_crew_id = public.current_profile_id()
    )
  );

create policy job_materials_access on public.job_materials
  for all using (
    exists (
      select 1 from public.jobs j
      where j.id = job_id
        and (
          j.assigned_crew_id = public.current_profile_id()
          or public.is_admin()
        )
    )
  )
  with check (
    exists (
      select 1 from public.jobs j
      where j.id = job_id
        and (
          j.assigned_crew_id = public.current_profile_id()
          or public.is_admin()
        )
    )
  );

create policy contracts_select on public.contracts
  for select using (customer_id = public.current_profile_id() or public.is_admin());

create policy contracts_admin_write on public.contracts
  for all using (public.is_admin())
  with check (public.is_admin());

create policy invoices_select on public.invoices
  for select using (customer_id = public.current_profile_id() or public.is_admin());

create policy invoices_admin_write on public.invoices
  for all using (public.is_admin())
  with check (public.is_admin());

create policy payments_select on public.payments
  for select using (customer_id = public.current_profile_id() or public.is_admin());

create policy payments_admin_write on public.payments
  for all using (public.is_admin())
  with check (public.is_admin());

create policy firewood_products_select on public.firewood_products
  for select using (active = true or public.is_admin());

create policy firewood_products_admin_write on public.firewood_products
  for all using (public.is_admin())
  with check (public.is_admin());

create policy firewood_orders_select on public.firewood_orders
  for select using (customer_id = public.current_profile_id() or public.is_admin());

create policy firewood_orders_insert_own on public.firewood_orders
  for insert with check (customer_id = public.current_profile_id() or public.is_admin());

create policy firewood_orders_update on public.firewood_orders
  for update using (customer_id = public.current_profile_id() or public.is_admin())
  with check (customer_id = public.current_profile_id() or public.is_admin());

create policy firewood_order_items_select on public.firewood_order_items
  for select using (
    exists (
      select 1 from public.firewood_orders o
      where o.id = order_id
        and (o.customer_id = public.current_profile_id() or public.is_admin())
    )
  );

create policy firewood_order_items_write on public.firewood_order_items
  for all using (
    exists (
      select 1 from public.firewood_orders o
      where o.id = order_id
        and (o.customer_id = public.current_profile_id() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.firewood_orders o
      where o.id = order_id
        and (o.customer_id = public.current_profile_id() or public.is_admin())
    )
  );

create policy storm_events_admin on public.storm_events
  for all using (public.is_admin())
  with check (public.is_admin());

create policy system_settings_select on public.system_settings
  for select using (auth.uid() is not null);

create policy system_settings_admin_write on public.system_settings
  for update using (public.is_admin())
  with check (public.is_admin());

create policy tax_settings_select on public.tax_settings
  for select using (auth.uid() is not null);

create policy tax_settings_admin_write on public.tax_settings
  for all using (public.is_admin())
  with check (public.is_admin());

create policy pricing_rules_select on public.pricing_rules
  for select using (auth.uid() is not null);

create policy pricing_rules_admin_write on public.pricing_rules
  for all using (public.is_admin())
  with check (public.is_admin());

create policy notifications_own on public.notifications
  for select using (user_id = public.current_profile_id() or public.is_admin());

create policy notifications_admin_write on public.notifications
  for all using (public.is_admin())
  with check (public.is_admin());

create policy audit_logs_admin_select on public.audit_logs
  for select using (public.is_admin());

create policy audit_logs_insert_authenticated on public.audit_logs
  for insert with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('job-media', 'job-media', false)
on conflict (id) do nothing;

create policy job_media_select on storage.objects
  for select using (
    bucket_id = 'job-media'
    and (
      public.is_admin()
      or auth.uid() is not null
    )
  );

create policy job_media_insert on storage.objects
  for insert with check (
    bucket_id = 'job-media'
    and auth.uid() is not null
  );

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.services, public.firewood_products, public.system_settings to anon;
grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
