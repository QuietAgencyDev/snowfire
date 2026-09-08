"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth/session";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function revalidateUpdates() {
  revalidatePath("/customer/updates");
  revalidatePath("/crew/updates");
  revalidatePath("/admin/updates");
  revalidatePath("/customer");
  revalidatePath("/crew");
  revalidatePath("/admin");
}

async function writeClient() {
  return createServiceRoleClient() ?? (await createServerSupabaseClient());
}

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const profile = await getSessionProfile();
  const notificationId = String(formData.get("notificationId") ?? "");

  if (!profile || !notificationId) {
    return;
  }

  const supabase = await writeClient();

  if (!supabase) {
    return;
  }

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", profile.id)
    .is("read_at", null);

  revalidateUpdates();
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const profile = await getSessionProfile();

  if (!profile) {
    return;
  }

  const supabase = await writeClient();

  if (!supabase) {
    return;
  }

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", profile.id)
    .is("read_at", null);

  revalidateUpdates();
}
