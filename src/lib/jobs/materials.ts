import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { JobMaterial } from "@/types/database";

export async function listJobMaterials(jobId: string): Promise<JobMaterial[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("job_materials")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (data && data.length > 0) {
    return data as JobMaterial[];
  }

  const privileged = createServiceRoleClient();

  if (!privileged) {
    return (data ?? []) as JobMaterial[];
  }

  const { data: fallback } = await privileged
    .from("job_materials")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  return (fallback ?? data ?? []) as JobMaterial[];
}
