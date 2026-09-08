"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/env";
import { homePathForRole, isUserRole } from "@/lib/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  message?: string;
};

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const signUpSchema = signInSchema.extend({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
});

function configurationError(): AuthState {
  return {
    error:
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
  };
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return configurationError();
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Unable to sign in." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return configurationError();
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        error:
          "Confirm your email first. Open the message from Supabase and use that link, then sign in.",
      };
    }

    return { error: "Email or password is incorrect." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unable to sign in right now. Please try again." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  redirect(
    profile && isUserRole(profile.role) ? homePathForRole(profile.role) : "/customer",
  );
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return configurationError();
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Unable to create account." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return configurationError();
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        phone: parsed.data.phone,
      },
    },
  });

  if (error) {
    return { error: "Unable to create this account right now. Please try again." };
  }

  if (!data.session) {
    return {
      message: "Check your email to confirm your account, then sign in.",
    };
  }

  redirect("/customer");
}

export async function signInWithOAuthAction(
  provider: "google" | "apple",
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return configurationError();
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return configurationError();
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error || !data.url) {
    const message = error?.message ?? "";
    if (message.toLowerCase().includes("provider is not enabled")) {
      return {
        error:
          "That sign-in method is not enabled yet. Use email and password, or turn on the provider in Supabase.",
      };
    }

    return {
      error: "Unable to start Google or Apple sign-in right now. Please try again.",
    };
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
