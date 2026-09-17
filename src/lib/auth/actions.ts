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

const resetRequestSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

const newPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Those passwords do not match.",
    path: ["confirm"],
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

// Supabase mails a one-time link; following it lands on /auth/callback, which
// trades the code for a short-lived session and forwards to /reset-password.
export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return configurationError();
  }

  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return configurationError();
  }

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/reset-password`,
  });

  // Deliberately the same answer whether or not that address has an account.
  // Saying "no such user" would turn this form into a way to test which of your
  // customers are registered. Rate limiting is Supabase's, and it does surface.
  if (error?.message.toLowerCase().includes("rate limit")) {
    return { error: "Too many attempts. Wait a minute and try again." };
  }

  return {
    message:
      "If that address has an account, a reset link is on its way. The link expires shortly.",
  };
}

export async function updatePasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return configurationError();
  }

  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Unable to set that password." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return configurationError();
  }

  // The recovery link is what authenticates this request. Without that session
  // there is nothing tying the form to an account, so refuse rather than guess.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "That reset link has expired. Request a new one and try again.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    if (error.message.toLowerCase().includes("should be different")) {
      return { error: "Choose a password you have not used before." };
    }

    return { error: "Unable to set that password right now. Please try again." };
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

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
