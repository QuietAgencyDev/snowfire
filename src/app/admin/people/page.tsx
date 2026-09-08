import type { Metadata } from "next";
import { listPeople } from "@/lib/admin/people";
import { roleLabel } from "@/lib/roles";

export const metadata: Metadata = {
  title: "People",
};

export default async function AdminPeoplePage() {
  const people = await listPeople();

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
          Operations
        </p>
        <h1 className="mt-1 text-4xl font-black text-slate-950">People</h1>
        <p className="mt-2 font-bold text-slate-700">
          Accounts on this project. Public signup is customer only. Crew and admin still need a
          role change in the database.
        </p>
      </div>
      {people.length === 0 ? (
        <p className="font-bold text-slate-600">No profiles yet.</p>
      ) : (
        <div className="grid gap-3">
          {people.map((person) => (
            <article
              key={person.id}
              className="rounded-3xl border-2 border-slate-200 bg-white p-4"
            >
              <p className="font-black text-slate-950">
                {person.first_name} {person.last_name}
              </p>
              <p className="font-bold text-sky-800">{person.email}</p>
              <p className="font-bold text-slate-600">{roleLabel(person.role)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
