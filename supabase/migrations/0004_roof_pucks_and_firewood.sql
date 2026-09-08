-- Roof salt pucks + firewood delivery profile on the property file.
-- Catalog rows are real products and a real service. They are not booked jobs.

alter table public.properties
  add column if not exists roof_type text,
  add column if not exists roof_notes text,
  add column if not exists salt_puck_count integer not null default 0,
  add column if not exists firewood_preferences jsonb not null default '[]'::jsonb,
  add column if not exists firewood_stack_location text,
  add column if not exists firewood_notes text;

alter table public.properties
  drop constraint if exists properties_salt_puck_count_nonneg;

alter table public.properties
  add constraint properties_salt_puck_count_nonneg check (salt_puck_count >= 0);

comment on column public.properties.salt_puck_count is
  'Requested roof salt pucks. Not a booked job.';
comment on column public.properties.firewood_preferences is
  'JSON array of firewood delivery preference IDs.';

insert into public.services (
  name,
  description,
  category,
  service_type,
  active,
  base_price,
  pricing_model
)
select
  'Roof Salt Pucks',
  'Place salt pucks along eaves, valleys, and ice-dam lines so melt water can drain instead of backing up under the shingles.',
  'SNOW',
  'ROOF_SALT_PUCKS',
  true,
  0,
  'CUSTOM_QUOTE'
where not exists (
  select 1 from public.services where service_type = 'ROOF_SALT_PUCKS'
);

insert into public.firewood_products (
  name,
  description,
  wood_type,
  seasoned,
  kiln_dried,
  quantity_unit,
  price,
  inventory_quantity,
  delivery_available,
  pickup_available,
  active
)
select
  'Seasoned Mixed Hardwood — Face Cord',
  'Ontario hardwood mix — maple, oak, and beech. Split, stacked, and air-dried for a hot, clean stove burn.',
  'mixed-hardwood',
  true,
  false,
  'face cord',
  18900,
  18,
  true,
  true,
  true
where not exists (
  select 1 from public.firewood_products
  where name = 'Seasoned Mixed Hardwood — Face Cord'
);

insert into public.firewood_products (
  name,
  description,
  wood_type,
  seasoned,
  kiln_dried,
  quantity_unit,
  price,
  inventory_quantity,
  delivery_available,
  pickup_available,
  active
)
select
  'Seasoned Mixed Hardwood — Full Cord',
  'A full measure for primary heat. Same mixed hardwood, ready for the woodshed.',
  'mixed-hardwood',
  true,
  false,
  'full cord',
  49900,
  8,
  true,
  true,
  true
where not exists (
  select 1 from public.firewood_products
  where name = 'Seasoned Mixed Hardwood — Full Cord'
);

insert into public.firewood_products (
  name,
  description,
  wood_type,
  seasoned,
  kiln_dried,
  quantity_unit,
  price,
  inventory_quantity,
  delivery_available,
  pickup_available,
  active
)
select
  'Sugar Maple — Face Cord',
  'Dense, long-burning maple. The quiet overnight log for a wood stove.',
  'maple',
  true,
  false,
  'face cord',
  21900,
  10,
  true,
  true,
  true
where not exists (
  select 1 from public.firewood_products
  where name = 'Sugar Maple — Face Cord'
);

insert into public.firewood_products (
  name,
  description,
  wood_type,
  seasoned,
  kiln_dried,
  quantity_unit,
  price,
  inventory_quantity,
  delivery_available,
  pickup_available,
  active
)
select
  'White Birch — Face Cord',
  'Bright bark, quick start, and a clean flame. Ideal beside maple for shoulder-season fires.',
  'birch',
  true,
  false,
  'face cord',
  23900,
  6,
  true,
  true,
  true
where not exists (
  select 1 from public.firewood_products
  where name = 'White Birch — Face Cord'
);

insert into public.firewood_products (
  name,
  description,
  wood_type,
  seasoned,
  kiln_dried,
  quantity_unit,
  price,
  inventory_quantity,
  delivery_available,
  pickup_available,
  active
)
select
  'Kiln-Dried Hardwood — Face Cord',
  'Kiln-dried below 20% moisture. Lights fast, less creosote, ready the day it lands.',
  'kiln-hardwood',
  true,
  true,
  'face cord',
  26900,
  7,
  true,
  true,
  true
where not exists (
  select 1 from public.firewood_products
  where name = 'Kiln-Dried Hardwood — Face Cord'
);

insert into public.firewood_products (
  name,
  description,
  wood_type,
  seasoned,
  kiln_dried,
  quantity_unit,
  price,
  inventory_quantity,
  delivery_available,
  pickup_available,
  active
)
select
  'Campfire Bundle',
  'A carry-out bundle for the pit or the first-night fire. Not a heating cord.',
  'mixed-hardwood',
  true,
  false,
  'bundle',
  2200,
  40,
  false,
  true,
  true
where not exists (
  select 1 from public.firewood_products
  where name = 'Campfire Bundle'
);

insert into public.firewood_products (
  name,
  description,
  wood_type,
  seasoned,
  kiln_dried,
  quantity_unit,
  price,
  inventory_quantity,
  delivery_available,
  pickup_available,
  active
)
select
  'Kindling Crate',
  'Split starters for stubborn stoves and wet November mornings.',
  'kindling',
  true,
  false,
  'crate',
  2800,
  30,
  true,
  true,
  true
where not exists (
  select 1 from public.firewood_products
  where name = 'Kindling Crate'
);
