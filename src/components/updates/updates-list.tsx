"use client";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import { notificationHref } from "@/lib/notifications/href";
import type { AppNotification } from "@/types/database";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-CA", {
    timeZone: "America/Toronto",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type UpdatesListProps = {
  items: AppNotification[];
  role: string;
};

export function UpdatesList({ items, role }: UpdatesListProps) {
  const unread = items.filter((item) => !item.read_at).length;

  if (items.length === 0) {
    return (
      <p className="font-bold text-slate-600">
        No updates yet. Booking, wood, and job movement will land here. This list stays empty
        until something real happens.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {unread > 0 ? (
        <form action={markAllNotificationsReadAction}>
          <button type="submit" className="font-black text-sky-800 underline">
            Mark {unread} read
          </button>
        </form>
      ) : null}
      <div className="grid gap-3">
        {items.map((item) => {
          const href = notificationHref(role, item.metadata);
          const unreadItem = !item.read_at;

          return (
            <article
              key={item.id}
              className={`rounded-3xl border-2 p-4 ${
                unreadItem
                  ? "border-orange-300 bg-orange-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                {formatWhen(item.created_at)}
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{item.title}</h2>
              <p className="mt-1 font-bold text-slate-700">{item.body}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {href ? (
                  <a href={href} className="font-black text-sky-800 underline">
                    Open
                  </a>
                ) : null}
                {unreadItem ? (
                  <form action={markNotificationReadAction}>
                    <input type="hidden" name="notificationId" value={item.id} />
                    <button type="submit" className="font-black text-slate-600 underline">
                      Mark read
                    </button>
                  </form>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
