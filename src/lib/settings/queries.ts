import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { BookingMode } from "@/types/database";

export async function getBookingMode(): Promise<BookingMode> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return "ADMIN_APPROVAL";
  }

  const { data } = await supabase
    .from("system_settings")
    .select("booking_mode")
    .eq("id", 1)
    .maybeSingle();

  return data?.booking_mode === "AUTO_CONFIRM" ? "AUTO_CONFIRM" : "ADMIN_APPROVAL";
}

export async function getOntarioTaxBps(): Promise<number> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return 1300;
  }

  const { data } = await supabase
    .from("tax_settings")
    .select("rate_bps")
    .eq("province", "ON")
    .eq("active", true)
    .maybeSingle();

  return typeof data?.rate_bps === "number" ? data.rate_bps : 1300;
}
