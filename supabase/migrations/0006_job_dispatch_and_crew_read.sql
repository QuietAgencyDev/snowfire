-- Link a job back to the approved request, and let assigned crew read that property.

alter table public.jobs
  add column if not exists service_request_id uuid unique references public.service_requests (id) on delete set null;

create index if not exists jobs_assigned_crew_id_idx on public.jobs (assigned_crew_id);
create index if not exists jobs_status_idx on public.jobs (status);

create policy properties_select_assigned_crew on public.properties
  for select using (
    exists (
      select 1 from public.jobs j
      where j.property_id = properties.id
        and j.assigned_crew_id = public.current_profile_id()
    )
  );
