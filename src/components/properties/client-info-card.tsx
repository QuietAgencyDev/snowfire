"use client";

import { useActionState } from "react";
import { updateClientInfoAction, type PropertyFormState } from "@/lib/properties/actions";
import type { Profile } from "@/types/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PropertyFormState = {};

type ClientInfoCardProps = {
  profile: Profile;
  returnTo: string;
};

export function ClientInfoCard({ profile, returnTo }: ClientInfoCardProps) {
  const [state, formAction, pending] = useActionState(updateClientInfoAction, initialState);

  return (
    <section className="rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
        Client info
      </p>
      <h2 className="mt-1 text-2xl font-black text-slate-950">Who we call</h2>
      <p className="mt-1 font-bold text-slate-700">
        Name and phone live on the account. Email stays with the login.
      </p>
      <form action={formAction} className="mt-4 grid gap-4">
        <input type="hidden" name="returnTo" value={returnTo} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="firstName" className="font-black">
              First name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              required
              defaultValue={profile.first_name}
              className="h-12 border-2 border-amber-100 font-semibold"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName" className="font-black">
              Last name
            </Label>
            <Input
              id="lastName"
              name="lastName"
              required
              defaultValue={profile.last_name}
              className="h-12 border-2 border-amber-100 font-semibold"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone" className="font-black">
            Phone
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            defaultValue={profile.phone ?? ""}
            className="h-12 border-2 border-amber-100 font-semibold"
          />
        </div>
        <div>
          <p className="font-black text-slate-950">Email</p>
          <p className="font-bold text-slate-700">{profile.email}</p>
        </div>
        {state.error ? (
          <Alert variant="destructive">
            <AlertTitle className="font-black">Unable to save</AlertTitle>
            <AlertDescription className="font-semibold">{state.error}</AlertDescription>
          </Alert>
        ) : null}
        {state.message ? (
          <Alert>
            <AlertTitle className="font-black">Saved</AlertTitle>
            <AlertDescription className="font-semibold">{state.message}</AlertDescription>
          </Alert>
        ) : null}
        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-fit bg-amber-500 px-5 font-black text-slate-950 hover:bg-amber-400"
        >
          {pending ? "Saving…" : "Save client info"}
        </Button>
      </form>
    </section>
  );
}
