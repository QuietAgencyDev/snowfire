import { NextResponse } from "next/server";
import { internalPath } from "@/lib/auth/safe-path";
import { homePathForRole, isUserRole } from "@/lib/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = internalPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.redirect(`${origin}/login?reason=not-configured`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const destination =
    next ??
    (profile && isUserRole(profile.role) ? homePathForRole(profile.role) : "/customer");

  return NextResponse.redirect(`${origin}${destination}`);
}
