import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppNotification } from "@/types/database";

export async function listMyNotifications(userId: string): Promise<AppNotification[]> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []) as AppNotification[];
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return 0;
  }

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);

  return count ?? 0;
}
