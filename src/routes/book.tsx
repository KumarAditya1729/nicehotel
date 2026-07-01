import { AppImage } from "@/components/site/AppImage";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BedDouble, CalendarDays, Users, Check, Loader2, ShieldCheck,
  ArrowRight, ArrowLeft, CheckCircle2, Lock, Plus, Trash2, BadgeCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getRooms, getRoomAvailability } from "@/lib/public.functions";
import { site } from "@/data/content";

type Room = {
  id: string; name: string; category: string | null; description: string | null;
  price: number; weekend_price: number | null; capacity: number;
  amenities: string[] | null; images: string[] | null; room_number: string | null;
};

type Avail = { roomId: string; name: string; total: number; booked: number; available: number };

type Line = {
  key: string;
  roomId: string;
  quantity: number;
  adults: number;
  children: number;
  extraBed: boolean;
  notes: string;
};

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): { room?: string } => ({
    room: typeof s.room === "string" ? s.room : undefined,
  }),
  loader: () => getRooms(),
  head: () => ({
    meta: [
      { title: "Book Your Stay — Nice Hotel And Restaurant, Mansa" },
      { name: "description", content: "Reserve one or more luxury rooms at Nice Hotel And Restaurant, Mansa. Choose dates, guests and pay securely online." },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: () => (
    <div className="container-luxe py-32 text-center">
      <p className="text-muted-foreground">We couldn't load availability. Please call us at {site.phone}.</p>
    </div>
  ),
  notFoundComponent: () => <div className="container-luxe py-32 text-center">Not found</div>,
  component: BookPage,
});

const todayStr = () => new Date().toISOString().slice(0, 10);
const EXTRA_BED = 800;
const TAX_RATE = 0.12;
const fieldCls = "w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30";
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const n = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
  return n > 0 ? n : 0;
}

let keyCounter = 0;
const newKey = () => `line-${++keyCounter}-${Date.now()}`;

function BookPage() {
  const rooms = Route.useLoaderData() as Room[];
  const { room: roomParam } = Route.useSearch();

  // dedupe room types (one card per name/price)
  const roomTypes = useMemo(() => {
    const seen = new Map<string, Room>();
    for (const r of rooms) { const k = `${r.name}-${r.price}`; if (!seen.has(k)) seen.set(k, r); }
    return [...seen.values()];
  }, [rooms]);

  const roomById = useMemo(() => Object.fromEntries(rooms.map((r) => [r.id, r])), [rooms]);

  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState("");
  const [availability, setAvailability] = useState<Avail[]>([]);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState<{ id: string } | null>(null);

  // Auth
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) { setUser({ id: data.user.id, email: data.user.email ?? "" }); setAuthEmail(data.user.email ?? ""); }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) setUser({ id: s.user.id, email: s.user.email ?? "" });
      else setUser(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Seed first line from query param, else from first room type
  useEffect(() => {
    if (lines.length || !roomTypes.length) return;
    const m = roomParam ? roomTypes.find((r) => r.name.toLowerCase() === roomParam.toLowerCase()) : null;
    const first = m ?? roomTypes[0];
    setLines([{ key: newKey(), roomId: first.id, quantity: 0, adults: 2, children: 0, extraBed: false, notes: "" }]);
  }, [roomParam, roomTypes, lines.length]);

  const nights = nightsBetween(checkIn, checkOut);

  // Length-of-stay selector: sets check-out based on check-in + number of nights.
  const setStayNights = (days: number) => {
    if (!Number.isFinite(days) || days < 1) return;
    const base = checkIn || todayStr();
    if (!checkIn) setCheckIn(base);
    const co = new Date(new Date(base).getTime() + days * 86400000).toISOString().slice(0, 10);
    setCheckOut(co);
  };

  // Live availability when dates chosen
  useEffect(() => {
    if (nights <= 0) { setAvailability([]); return; }
    let active = true;
    getRoomAvailability({ data: { checkIn, checkOut } })
      .then((a) => { if (active) setAvailability(a as Avail[]); })
      .catch(() => { if (active) setAvailability([]); });
    return () => { active = false; };
  }, [checkIn, checkOut, nights]);

  const availFor = (roomId: string) => availability.find((a) => a.roomId === roomId);

  const priced = useMemo(() => {
    const computed = lines.map((l) => {
      const room = roomById[l.roomId];
      const base = room ? Number(room.price) * nights : 0;
      const extra = l.extraBed ? EXTRA_BED * nights : 0;
      const unitPrice = base + extra;
      return { line: l, room, unitPrice, lineTotal: unitPrice * l.quantity };
    });
    const subtotal = computed.reduce((s, c) => s + c.lineTotal, 0);
    const taxes = Math.round(subtotal * TAX_RATE);
    return { computed, subtotal, taxes, grandTotal: subtotal + taxes };
  }, [lines, roomById, nights]);

  const totalRooms = lines.reduce((s, l) => s + l.quantity, 0);
  const totalGuests = lines.reduce((s, l) => s + (l.adults + l.children) * l.quantity, 0);

  const updateLine = (key: string, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const removeLine = (key: string) => setLines((ls) => ls.filter((l) => l.key !== key));
  const addLine = () => {
    const first = roomTypes[0];
    if (!first) return;
    setLines((ls) => [...ls, { key: newKey(), roomId: first.id, quantity: 0, adults: 2, children: 0, extraBed: false, notes: "" }]);
  };

  const auth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({ email: authEmail, password: authPass, options: { emailRedirectTo: window.location.origin + "/book" } });
        if (error) throw error;
        const { error: e2 } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
        if (e2) throw e2;
        toast.success("Account created — you're signed in");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally { setAuthBusy(false); }
  };

  const validateRooms = (): string | null => {
    if (!lines.length) return "Please add at least one room";
    if (totalRooms < 1) return "Please select at least one room (set the number of rooms above 0)";
    for (const l of lines) {
      const a = availFor(l.roomId);
      if (a && l.quantity > a.available) {
        const room = roomById[l.roomId];
        return `${room?.name ?? "Room"}: only ${a.available} available for these dates`;
      }
    }
    return null;
  };

  const pay = async () => {
    if (!user) return;
    if (nights <= 0) { toast.error("Please choose valid dates"); return; }
    const rerr = validateRooms();
    if (rerr) { toast.error(rerr); return; }
    if (!name || !phone) { toast.error("Please enter your name and phone"); return; }
    setPaying(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Payment SDK failed to load");
      const items = lines.map((l) => ({ roomId: l.roomId, quantity: l.quantity, adults: l.adults, children: l.children, extraBed: l.extraBed, notes: l.notes || undefined }));
      const orderRes = await fetch("/api/public/razorpay/order", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ items, checkIn, checkOut }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || "Could not start payment");

      const rzp = new (window as any).Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency,
        name: "Nice Hotel & Restaurant",
        description: `${totalRooms} room${totalRooms > 1 ? "s" : ""} · ${order.nights} night${order.nights > 1 ? "s" : ""}`,
        order_id: order.orderId,
        prefill: { name, email: user.email, contact: phone },
        theme: { color: "#B98A3E" },
        modal: { ondismiss: () => setPaying(false) },
        handler: async (resp: any) => {
          try {
            const { data: sess } = await supabase.auth.getSession();
            const accessToken = sess.session?.access_token;
            const vr = await fetch("/api/public/razorpay/verify", {
              method: "POST",
              headers: { "content-type": "application/json", ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}) },
              body: JSON.stringify({
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                items, checkIn, checkOut, guests: totalGuests,
                guestName: name, guestEmail: user.email, guestPhone: phone,
                specialRequests: requests || undefined,
              }),
            });
            const v = await vr.json();
            if (!vr.ok) throw new Error(v.error || "Verification failed");
            setDone({ id: v.bookingId });
            toast.success("Booking confirmed!");
          } catch (err: any) {
            toast.error(err.message ?? "We could not confirm your booking. Contact us with your payment ID.");
          } finally { setPaying(false); }
        },
      });
      rzp.on("payment.failed", () => { toast.error("Payment failed. Please try again."); setPaying(false); });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message ?? "Could not start payment");
      setPaying(false);
    }
  };

  if (done) {
    return (
      <div className="container-luxe flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <CheckCircle2 className="h-16 w-16 text-gold" />
        <h1 className="mt-6 font-display text-4xl text-charcoal">Booking Confirmed</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Thank you, {name}. Your reservation for <strong>{totalRooms} room{totalRooms > 1 ? "s" : ""}</strong> is confirmed and a confirmation email is on its way to {user?.email}.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Reference: {done.id.slice(0, 8).toUpperCase()}</p>
        <div className="mt-8 flex gap-3">
          <Link to="/" className="rounded-full bg-charcoal px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition hover:bg-gold">Back to Home</Link>
          <Link to="/rooms" className="rounded-full border border-charcoal px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] text-charcoal transition hover:bg-charcoal hover:text-ivory">View Rooms</Link>
        </div>
      </div>
    );
  }

  const steps = ["Dates", "Rooms", "Account", "Pay"];

  return (
    <div className="bg-ivory pb-24 pt-28">
      <div className="container-luxe">
        <p className="eyebrow">Reservations</p>
        <h1 className="mt-2 font-display text-4xl text-charcoal sm:text-5xl">Book Your Stay</h1>

        {/* Stepper */}
        <div className="mt-8 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${step > i + 1 ? "bg-gold text-ivory" : step === i + 1 ? "bg-charcoal text-ivory" : "bg-beige text-muted-foreground"}`}>
                {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden text-xs uppercase tracking-wider sm:block ${step === i + 1 ? "text-charcoal" : "text-muted-foreground"}`}>{s}</span>
              {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
            {/* Step 1 — Dates */}
            {step === 1 && (
              <div>
                <h2 className="font-display text-2xl text-charcoal">Choose your dates</h2>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="text-xs text-muted-foreground">
                    <span className="mb-1.5 flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-gold" /> Check-in</span>
                    <input type="date" min={todayStr()} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={fieldCls} />
                  </label>
                  <label className="text-xs text-muted-foreground">
                    <span className="mb-1.5 flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-gold" /> Check-out</span>
                    <input type="date" min={checkIn || todayStr()} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={fieldCls} />
                  </label>
                </div>
                <label className="mt-4 block text-xs text-muted-foreground">
                  <span className="mb-1.5 flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-gold" /> Number of nights you want to stay</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min={1} max={60}
                      value={nights > 0 ? nights : ""}
                      placeholder="e.g. 2"
                      onChange={(e) => setStayNights(Number(e.target.value))}
                      className={`${fieldCls} max-w-[160px]`}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 2, 3, 5, 7].map((d) => (
                        <button key={d} type="button" onClick={() => setStayNights(d)}
                          className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${nights === d ? "border-gold bg-gold text-ivory" : "border-border text-muted-foreground hover:border-gold hover:text-gold"}`}>
                          {d} night{d > 1 ? "s" : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                </label>
                {nights > 0 && <p className="mt-4 text-sm text-charcoal">{nights} night{nights > 1 ? "s" : ""} selected · {nights + 1} day{nights + 1 > 1 ? "s" : ""}</p>}
              </div>
            )}

            {/* Step 2 — Rooms */}
            {step === 2 && (
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl text-charcoal">Your rooms</h2>
                  <button onClick={addLine} className="flex items-center gap-1.5 rounded-full border border-gold px-4 py-2 text-xs font-medium uppercase tracking-wider text-gold transition hover:bg-gold hover:text-ivory">
                    <Plus className="h-4 w-4" /> Add another room
                  </button>
                </div>
                <div className="mt-6 space-y-5">
                  {lines.map((l, idx) => {
                    const room = roomById[l.roomId];
                    const a = availFor(l.roomId);
                    const c = priced.computed.find((x) => x.line.key === l.key);
                    return (
                      <div key={l.key} className="rounded-2xl border border-border p-5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-lg text-charcoal">Room {idx + 1}</h3>
                          {lines.length > 1 && (
                            <button onClick={() => removeLine(l.key)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                              <Trash2 className="h-3.5 w-3.5" /> Remove
                            </button>
                          )}
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <label className="text-xs text-muted-foreground sm:col-span-2">
                            <span className="mb-1.5 block">Room type</span>
                            <select value={l.roomId} onChange={(e) => updateLine(l.key, { roomId: e.target.value })} className={fieldCls}>
                              {roomTypes.map((r) => (
                                <option key={r.id} value={r.id}>{r.name} — {inr(Number(r.price))}/night</option>
                              ))}
                            </select>
                            {a && (
                              <span className={`mt-1.5 inline-flex items-center gap-1 text-[11px] ${a.available > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                <BadgeCheck className="h-3.5 w-3.5" />
                                {a.available > 0 ? `${a.available} of ${a.total} available` : "Fully booked for these dates"}
                              </span>
                            )}
                          </label>
                          <label className="text-xs text-muted-foreground">
                            <span className="mb-1.5 block">Number of rooms</span>
                            <input type="number" min={0} max={a?.available ?? 10} value={l.quantity} placeholder="0" onChange={(e) => updateLine(l.key, { quantity: Math.max(0, Math.min(a?.available ?? 99, Number(e.target.value))) })} className={fieldCls} />
                          </label>
                          <label className="text-xs text-muted-foreground">
                            <span className="mb-1.5 block">Adults</span>
                            <input type="number" min={1} value={l.adults} onChange={(e) => updateLine(l.key, { adults: Math.max(1, Number(e.target.value)) })} className={fieldCls} />
                          </label>
                          <label className="text-xs text-muted-foreground">
                            <span className="mb-1.5 block">Children</span>
                            <input type="number" min={0} value={l.children} onChange={(e) => updateLine(l.key, { children: Math.max(0, Number(e.target.value)) })} className={fieldCls} />
                          </label>
                          <label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <input type="checkbox" checked={l.extraBed} onChange={(e) => updateLine(l.key, { extraBed: e.target.checked })} className="h-4 w-4 accent-gold" />
                            Extra bed (+{inr(EXTRA_BED)}/night)
                          </label>
                          <label className="text-xs text-muted-foreground sm:col-span-2">
                            <span className="mb-1.5 block">Special requests for this room (optional)</span>
                            <input value={l.notes} onChange={(e) => updateLine(l.key, { notes: e.target.value })} className={fieldCls} placeholder="e.g. high floor, twin beds" />
                          </label>
                        </div>
                        {c && nights > 0 && (
                          <p className="mt-3 text-right text-sm text-charcoal">{inr(c.unitPrice)} × {l.quantity} = <strong>{inr(c.lineTotal)}</strong></p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3 — Account */}
            {step === 3 && (
              <div>
                <h2 className="font-display text-2xl text-charcoal">Your details</h2>
                {!user ? (
                  <div className="mt-5">
                    <div className="mb-4 inline-flex rounded-full bg-beige p-1 text-xs">
                      <button onClick={() => setAuthMode("signup")} className={`rounded-full px-4 py-1.5 ${authMode === "signup" ? "bg-charcoal text-ivory" : "text-muted-foreground"}`}>Create account</button>
                      <button onClick={() => setAuthMode("signin")} className={`rounded-full px-4 py-1.5 ${authMode === "signin" ? "bg-charcoal text-ivory" : "text-muted-foreground"}`}>Sign in</button>
                    </div>
                    <p className="mb-3 text-xs text-muted-foreground">Sign in so we can save your booking and send confirmations.</p>
                    <form onSubmit={auth} className="grid grid-cols-1 gap-3">
                      <input required type="email" placeholder="Email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className={fieldCls} />
                      <input required type="password" placeholder="Password (min 6 chars)" minLength={6} value={authPass} onChange={(e) => setAuthPass(e.target.value)} className={fieldCls} />
                      <button type="submit" disabled={authBusy} className="rounded-full bg-gold px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition hover:bg-charcoal disabled:opacity-60">
                        {authBusy ? "Please wait…" : authMode === "signup" ? "Create account & continue" : "Sign in & continue"}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="mt-5">
                    <div className="flex items-center gap-2 rounded-xl bg-beige px-4 py-3 text-sm text-charcoal">
                      <ShieldCheck className="h-4 w-4 text-gold" /> Signed in as {user.email}
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={fieldCls} />
                      <input required placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldCls} />
                      <textarea placeholder="Special requests for the whole booking (optional)" rows={3} value={requests} onChange={(e) => setRequests(e.target.value)} className={`${fieldCls} sm:col-span-2`} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4 — Review & pay */}
            {step === 4 && (
              <div>
                <h2 className="font-display text-2xl text-charcoal">Review & pay</h2>
                <div className="mt-6 space-y-3 text-sm">
                  <Row label="Check-in" value={checkIn} />
                  <Row label="Check-out" value={checkOut} />
                  <Row label="Nights" value={String(nights)} />
                  <Row label="Guest" value={name} />
                  <Row label="Phone" value={phone} />
                </div>
                <div className="mt-5 space-y-3">
                  {priced.computed.map((c, i) => (
                    <div key={c.line.key} className="rounded-xl border border-border p-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-charcoal">Room {i + 1}: {c.room?.name} × {c.line.quantity}</span>
                        <span className="text-gold">{inr(c.lineTotal)}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {c.line.adults} adult{c.line.adults > 1 ? "s" : ""}{c.line.children ? `, ${c.line.children} child` : ""}{c.line.extraBed ? ", extra bed" : ""}
                        {c.line.notes ? ` · ${c.line.notes}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
                <button onClick={pay} disabled={paying} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-4 text-sm font-medium uppercase tracking-[0.2em] text-ivory transition hover:bg-gold disabled:opacity-60">
                  {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Pay {inr(priced.grandTotal)} securely
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-gold" /> Secured by Razorpay</p>
              </div>
            )}

            {/* Nav buttons */}
            <div className="mt-8 flex items-center justify-between">
              <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-charcoal disabled:opacity-0">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {step < 4 && (
                <button
                  onClick={() => {
                    if (step === 1 && nights <= 0) return toast.error("Please choose valid dates");
                    if (step === 2) { const e = validateRooms(); if (e) return toast.error(e); }
                    if (step === 3 && !user) return toast.error("Please sign in to continue");
                    if (step === 3 && (!name || !phone)) return toast.error("Please enter your name and phone");
                    setStep((s) => s + 1);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-gold px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition hover:bg-charcoal">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-2xl bg-card p-6 shadow-card lg:sticky lg:top-28">
            {lines.length ? (
              <>
                <div className="h-36 overflow-hidden rounded-xl bg-beige">
                  <AppImage src={roomById[lines[0].roomId]?.images} alt="Your stay" className="h-full w-full object-cover" />
                </div>
                <h3 className="mt-4 font-display text-xl text-charcoal">Booking summary</h3>
                <p className="text-xs text-muted-foreground">{totalRooms} room{totalRooms > 1 ? "s" : ""} · {totalGuests} guest{totalGuests > 1 ? "s" : ""} · {nights || 0} night{nights === 1 ? "" : "s"}</p>
                <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  {priced.computed.map((c, i) => (
                    <div key={c.line.key} className="flex justify-between text-muted-foreground">
                      <span>{c.room?.name} ×{c.line.quantity}</span>
                      <span>{inr(c.lineTotal)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-muted-foreground border-t border-border pt-2"><span>Subtotal</span><span>{inr(priced.subtotal)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>GST (12%)</span><span>{inr(priced.taxes)}</span></div>
                  <div className="flex justify-between font-display text-lg text-charcoal"><span>Total</span><span className="text-gold">{inr(priced.grandTotal)}</span></div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
                <BedDouble className="h-8 w-8 text-gold" />
                <p className="mt-3 text-sm">Add a room to see your summary.</p>
              </div>
            )}
            <p className="mt-5 text-[11px] text-muted-foreground">Need help? Call {site.phone}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-charcoal">{value}</span>
    </div>
  );
}
