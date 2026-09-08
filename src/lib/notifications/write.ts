import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type NotificationInput = {
  userId: string;
  type:
    | "BOOKING_RECEIVED"
    | "BOOKING_APPROVED"
    | "BOOKING_DECLINED"
    | "FIREWOOD_ORDER_RECEIVED"
    | "CREW_ASSIGNED"
    | "CREW_EN_ROUTE"
    | "CREW_ARRIVED"
    | "JOB_STARTED"
    | "JOB_COMPLETED";
  title: string;
  body: string;
  metadata?: Record<string, string>;
};

export async function writeNotification(input: NotificationInput): Promise<void> {
  const privileged = createServiceRoleClient();
  const supabase = privileged ?? (await createServerSupabaseClient());

  if (!supabase) {
    return;
  }

  await supabase.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    metadata: input.metadata ?? {},
  });
}
