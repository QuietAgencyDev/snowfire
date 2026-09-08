import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function listPeople(): Promise<Profile[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("role", { ascending: true })
    .order("last_name", { ascending: true });

  return (data ?? []) as Profile[];
}
