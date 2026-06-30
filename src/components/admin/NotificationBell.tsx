import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, CheckCheck, Trash2, CalendarCheck, MessageSquare, PartyPopper, CreditCard, Dot } from "lucide-react";
import { useRows, useInvalidate } from "@/lib/admin/data";
import { adminNotificationsMarkRead, adminNotificationsClear } from "@/lib/admin.functions";

type Notif = { id: string; type: string; title: string; body?: string | null; link?: string | null; read: boolean; created_at: string };

const ICONS: Record<string, typeof Bell> = {
  booking: CalendarCheck,
  enquiry: MessageSquare,
  venue: PartyPopper,
  payment: CreditCard,
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function NotificationBell() {
  const { data = [] } = useRows<Notif>("notifications", { orderBy: "created_at", ascending: false });
  const invalidate = useInvalidate();
  const [open, setOpen] = useState(false);
  const unread = useMemo(() => data.filter((n) => !n.read).length, [data]);

  const markAll = async () => { await adminNotificationsMarkRead({ data: { all: true } }); invalidate("notifications"); };
  const markOne = async (id: string) => { await adminNotificationsMarkRead({ data: { id } }); invalidate("notifications"); };
  const clearAll = async () => { await adminNotificationsClear(); invalidate("notifications"); };

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5" title="Notifications">
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B98A3E] px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <div className="flex items-center gap-2 text-[#B98A3E]">
                <button onClick={markAll} title="Mark all read" className="hover:opacity-70"><CheckCheck className="h-4 w-4" /></button>
                <button onClick={clearAll} title="Clear all" className="hover:opacity-70"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {data.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted-foreground">No notifications yet.</p>}
              {data.slice(0, 30).map((n) => {
                const Ico = ICONS[n.type] ?? Bell;
                const inner = (
                  <div className={`flex gap-3 px-4 py-3 transition hover:bg-[#FAFAF8] ${n.read ? "" : "bg-[#B98A3E]/5"}`}>
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-beige text-[#B98A3E]"><Ico className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 text-sm font-medium text-[#161616]">
                        {!n.read && <Dot className="-ml-1 h-4 w-4 text-[#B98A3E]" />}{n.title}
                      </p>
                      {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                );
                return n.link ? (
                  <Link key={n.id} to={n.link as any} onClick={() => { markOne(n.id); setOpen(false); }} className="block">{inner}</Link>
                ) : (
                  <button key={n.id} onClick={() => markOne(n.id)} className="block w-full text-left">{inner}</button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
