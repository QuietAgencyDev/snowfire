import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isUserRole } from "@/lib/roles";
import type { Profile } from "@/types/database";

export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || !isUserRole(profile.role)) {
    return null;
  }

  return profile as Profile;
}
