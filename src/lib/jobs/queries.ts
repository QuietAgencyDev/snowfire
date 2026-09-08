import { formatPropertyAddress, propertyCoordinates } from "@/lib/properties/address";
import { PROPERTY_MEDIA_BUCKET } from "@/lib/photos/paths";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Job, JobPhoto, JobPhotoView, JobView, Profile, Property } from "@/types/database";

type JobRow = Job & {
  properties: Property | Property[] | null;
  services: { name: string } | { name: string }[] | null;
  customer: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
  crew: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function asView(row: JobRow, property?: Property | null): JobView {
  const embedded = first(row.properties);
  const place = property ?? embedded;
  const service = first(row.services);
  const customer = first(row.customer);
  const crew = first(row.crew);
  const coords = place ? propertyCoordinates(place) : null;

  return {
    ...row,
    property_name: place?.name ?? "Property",
    property_address: place ? formatPropertyAddress(place) : "Address unavailable",
    service_name: service?.name ?? "Service",
    customer_name: customer ? `${customer.first_name} ${customer.last_name}`.trim() : "Customer",
    crew_name: crew ? `${crew.first_name} ${crew.last_name}`.trim() : null,
    hazards: place?.hazards ?? null,
    special_instructions: place?.special_instructions ?? null,
    snow_storage_location: place?.snow_storage_location ?? null,
    driveway_type: place?.driveway_type ?? null,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
  };
}

const JOB_SELECT = `
  *,
  properties (*),
  services ( name ),
  customer:profiles!jobs_customer_id_fkey ( first_name, last_name ),
  crew:profiles!jobs_assigned_crew_id_fkey ( first_name, last_name )
`;

async function loadPropertyFallback(propertyId: string): Promise<Property | null> {
  const privileged = createServiceRoleClient();

  if (!privileged) {
    return null;
  }

  const { data } = await privileged
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .maybeSingle();

  return (data as Property | null) ?? null;
}

async function hydrate(rows: JobRow[]): Promise<JobView[]> {
  return Promise.all(
    rows.map(async (row) => {
      const embedded = first(row.properties);
      const property = embedded ?? (await loadPropertyFallback(row.property_id));
      return asView(row, property);
    }),
  );
}

export async function listCrewMembers(): Promise<Profile[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "CREW")
    .order("first_name", { ascending: true });

  return (data ?? []) as Profile[];
}

export async function listOpenJobPropertyIds(): Promise<Set<string>> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return new Set();
  }

  const { data } = await supabase
    .from("jobs")
    .select("property_id")
    .in("status", ["UNASSIGNED", "ASSIGNED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"]);

  return new Set((data ?? []).map((row) => String(row.property_id)));
}

export async function listOpenJobs(): Promise<JobView[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .in("status", ["UNASSIGNED", "ASSIGNED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"])
    .order("created_at", { ascending: false });

  return hydrate((data ?? []) as unknown as JobRow[]);
}

export async function listAssignedCrewJobs(crewId: string): Promise<JobView[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("assigned_crew_id", crewId)
    .in("status", ["ASSIGNED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"])
    .order("scheduled_start", { ascending: true });

  return hydrate((data ?? []) as unknown as JobRow[]);
}

export async function listCustomerJobs(customerId: string): Promise<JobView[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return hydrate((data ?? []) as unknown as JobRow[]);
}

export async function getJobById(jobId: string): Promise<JobView | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.from("jobs").select(JOB_SELECT).eq("id", jobId).maybeSingle();

  if (!data) {
    return null;
  }

  const [view] = await hydrate([data as unknown as JobRow]);
  return view ?? null;
}

export async function listJobPhotos(jobId: string): Promise<JobPhotoView[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("job_photos")
    .select("*")
    .eq("job_id", jobId)
    .order("captured_at", { ascending: true });

  const photos = (data ?? []) as JobPhoto[];

  return Promise.all(
    photos.map(async (photo) => {
      const { data: signed } = await supabase.storage
        .from(PROPERTY_MEDIA_BUCKET)
        .createSignedUrl(photo.storage_path, 60 * 60);

      return {
        ...photo,
        signedUrl: signed?.signedUrl ?? null,
      };
    }),
  );
}
