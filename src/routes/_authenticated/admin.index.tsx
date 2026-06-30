import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarCheck, LogIn, LogOut, Clock, BedDouble, DoorOpen, IndianRupee, UtensilsCrossed, Star, MessageSquare } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { PageTitle } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/ResourceManager";
import { useRows } from "@/lib/admin/data";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

const todayStr = () => new Date().toISOString().slice(0, 10);

function StatCard({ icon: Icon, label, value, tone = "#B98A3E" }: { icon: typeof CalendarCheck; label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${tone}1a`, color: tone }}><Icon className="h-[18px] w-[18px]" /></span>
      </div>
      <p className="mt-3 font-display text-3xl text-[#161616]">{value}</p>
    </div>
  );
}

function Dashboard() {
  const { data: bookings = [] } = useRows<any>("bookings");
  const { data: rooms = [] } = useRows<any>("rooms");
  const { data: enquiries = [] } = useRows<any>("enquiries");
  const { data: reviews = [] } = useRows<any>("reviews");
  const today = todayStr();

  const stats = useMemo(() => {
    const checkins = bookings.filter((b) => b.check_in === today).length;
    const checkouts = bookings.filter((b) => b.check_out === today).length;
    const todays = bookings.filter((b) => (b.created_at ?? "").slice(0, 10) === today).length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const occupied = rooms.filter((r) => r.status === "occupied").length;
    const available = rooms.filter((r) => r.status === "available").length;
    const revenue = bookings.filter((b) => b.payment_status === "paid").reduce((s, b) => s + Number(b.amount || 0), 0);
    return { checkins, checkouts, todays, pending, occupied, available, revenue };
  }, [bookings, rooms, today]);

  const trend = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return { day: d.toLocaleDateString("en", { weekday: "short" }), key, bookings: 0, revenue: 0 };
    });
    for (const b of bookings) {
      const k = (b.created_at ?? "").slice(0, 10);
      const slot = days.find((x) => x.key === k);
      if (slot) { slot.bookings += 1; slot.revenue += Number(b.amount || 0); }
    }
    return days;
  }, [bookings]);

  const recent = useMemo(() => [...bookings].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")).slice(0, 6), [bookings]);

  return (
    <div>
      <PageTitle title="Dashboard" subtitle="Live overview of your hotel operations" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Today's Bookings" value={stats.todays} />
        <StatCard icon={LogIn} label="Check-ins" value={stats.checkins} tone="#2E7D32" />
        <StatCard icon={LogOut} label="Check-outs" value={stats.checkouts} tone="#F9A825" />
        <StatCard icon={Clock} label="Pending Requests" value={stats.pending} tone="#C62828" />
        <StatCard icon={DoorOpen} label="Available Rooms" value={stats.available} tone="#2E7D32" />
        <StatCard icon={BedDouble} label="Occupied Rooms" value={stats.occupied} tone="#C62828" />
        <StatCard icon={IndianRupee} label="Revenue (paid)" value={`₹${stats.revenue.toLocaleString("en-IN")}`} />
        <StatCard icon={Star} label="Reviews" value={reviews.length} tone="#F9A825" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 font-display text-xl text-[#161616]">Bookings — last 7 days</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trend} margin={{ left: -20, right: 8 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B98A3E" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#B98A3E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000008" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="bookings" stroke="#B98A3E" strokeWidth={2} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-display text-xl text-[#161616]">Revenue trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trend} margin={{ left: -20, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000008" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#161616" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 font-display text-xl text-[#161616]"><CalendarCheck className="h-5 w-5 text-[#B98A3E]" /> Recent Bookings</h3>
          {recent.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No bookings yet.</p>}
          <div className="space-y-2">
            {recent.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl bg-[#FAFAF8] px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{b.guest_name}</p>
                  <p className="text-xs text-muted-foreground">{b.room_type || "—"} · {b.check_in || "—"}</p>
                </div>
                <StatusBadge value={b.status} />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-display text-xl text-[#161616]"><MessageSquare className="h-5 w-5 text-[#B98A3E]" /> Latest Enquiries</h3>
          {enquiries.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No enquiries yet.</p>}
          <div className="space-y-2">
            {[...enquiries].slice(0, 5).map((e) => (
              <div key={e.id} className="rounded-xl bg-[#FAFAF8] px-4 py-3">
                <div className="flex items-center justify-between"><p className="text-sm font-medium">{e.name}</p><StatusBadge value={e.status} /></div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{e.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground"><UtensilsCrossed className="mr-1 inline h-3 w-3" /> Restaurant, events & analytics modules available in the sidebar.</p>
    </div>
  );
}