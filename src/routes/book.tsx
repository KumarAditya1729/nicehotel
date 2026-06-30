import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BedDouble, CalendarDays, Users, Check, Loader2, ShieldCheck,
  ArrowRight, ArrowLeft, Star, CheckCircle2, Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getRooms } from "@/lib/public.functions";
import { site } from "@/data/content";

type Room = {
  id: string; name: string; category: string | null; description: string | null;
  price: number; weekend_price: number | null; capacity: number;
  amenities: string[] | null; images: string[] | null; room_number: string | null;
};

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): { room?: string } => ({
    room: typeof s.room === "string" ? s.room : undefined,
  }),
  loader: () => getRooms(),
  head: () => ({
    meta: [
      { title: "Book Your Stay — Nice Hotel And Restaurant, Mansa" },
      { name: "description", content: "Reserve a luxury room at Nice Hotel And Restaurant, Mansa. Choose dates, guests and pay securely online." },
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
const fieldCls = "w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30";

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

function BookPage() {
  const rooms = Route.useLoaderData() as Room[];
  const { room: roomParam } = Route.useSearch();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [roomId, setRoomId] = useState<string>("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState("");
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
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? "" });
        setAuthEmail(data.user.email ?? "");
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) setUser({ id: s.user.id, email: s.user.email ?? "" });
      else setUser(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Preselect from query param (room name)
  useEffect(() => {
    if (roomId) return;
    if (roomParam) {
      const m = rooms.find((r) => r.name.toLowerCase() === roomParam.toLowerCase());
      if (m) { setRoomId(m.id); return; }
    }
  }, [roomParam, rooms, roomId]);

  const room = useMemo(() => rooms.find((r) => r.id === roomId), [rooms, roomId]);
  const nights = nightsBetween(checkIn, checkOut);
  const total = room ? Number(room.price) * nights : 0;

  // dedupe room types for cleaner selection (one card per name/price)
  const roomCards = useMemo(() => {
    const seen = new Map<string, Room>();
    for (const r of rooms) { const k = `${r.name}-${r.price}`; if (!seen.has(k)) seen.set(k, r); }
    return [...seen.values()];
  }, [rooms]);

  const auth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: authEmail, password: authPass,
          options: { emailRedirectTo: window.location.origin + "/book" },
        });
        if (error) throw error;
        // auto-confirm enabled → sign in immediately
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

  const pay = async () => {
    if (!room || !user) return;
    if (nights <= 0) { toast.error("Please choose valid dates"); return; }
    if (!name || !phone) { toast.error("Please enter your name and phone"); return; }
    setPaying(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Payment SDK failed to load");
      const orderRes = await fetch("/api/public/razorpay/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roomId: room.id, checkIn, checkOut }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || "Could not start payment");

      const rzp = new (window as any).Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Nice Hotel & Restaurant",
        description: `${order.roomName} · ${order.nights} night${order.nights > 1 ? "s" : ""}`,
        order_id: order.orderId,
        prefill: { name, email: user.email, contact: phone },
        theme: { color: "#B98A3E" },
        modal: { ondismiss: () => setPaying(false) },
        handler: async (resp: any) => {
          try {
            const vr = await fetch("/api/public/razorpay/verify", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                roomId: room.id, checkIn, checkOut, guests,
                guestName: name, guestEmail: user.email, guestPhone: phone,
                specialRequests: requests || undefined, userId: user.id,
              }),
            });
            const v = await vr.json();
            if (!vr.ok) throw new Error(v.error || "Verification failed");
            setDone({ id: v.bookingId });
            toast.success("Booking confirmed! Confirmation email sent.");
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
          Thank you, {name}. Your reservation for <strong>{room?.name}</strong> is confirmed and a confirmation email is on its way to {user?.email}.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Reference: {done.id.slice(0, 8).toUpperCase()}</p>
        <div className="mt-8 flex gap-3">
          <Link to="/" className="rounded-full bg-charcoal px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition hover:bg-gold">Back to Home</Link>
          <Link to="/rooms" className="rounded-full border border-charcoal px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] text-charcoal transition hover:bg-charcoal hover:text-ivory">View Rooms</Link>
        </div>
      </div>
    );
  }

  const steps = ["Room", "Dates", "Account", "Pay"];

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
          {/* Main panel */}
          <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
            {step === 1 && (
              <div>
                <h2 className="font-display text-2xl text-charcoal">Choose your room</h2>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {roomCards.map((r) => (
                    <button key={r.id} onClick={() => { setRoomId(r.id); setGuests(Math.min(guests, r.capacity)); }}
                      className={`overflow-hidden rounded-2xl border text-left transition ${roomId === r.id ? "border-gold ring-2 ring-gold/30" : "border-border hover:border-gold/50"}`}>
                      <div className="h-40 overflow-hidden bg-beige">
                        {r.images?.[0] && <img src={r.images[0]} alt={r.name} className="h-full w-full object-cover" loading="lazy" />}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-lg text-charcoal">{r.name}</h3>
                          {roomId === r.id && <Check className="h-5 w-5 text-gold" />}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-brown"><Users className="h-3.5 w-3.5 text-gold" /> {r.capacity} guests</span>
                          <span className="font-display text-xl text-gold">₹{Number(r.price).toLocaleString("en-IN")}<span className="text-xs text-muted-foreground">/night</span></span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="font-display text-2xl text-charcoal">Dates & guests</h2>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="text-xs text-muted-foreground">
                    <span className="mb-1.5 flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-gold" /> Check-in</span>
                    <input type="date" min={todayStr()} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={fieldCls} />
                  </label>
                  <label className="text-xs text-muted-foreground">
                    <span className="mb-1.5 flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-gold" /> Check-out</span>
                    <input type="date" min={checkIn || todayStr()} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={fieldCls} />
                  </label>
                  <label className="text-xs text-muted-foreground sm:col-span-2">
                    <span className="mb-1.5 flex items-center gap-1.5"><Users className="h-4 w-4 text-gold" /> Guests {room ? `(max ${room.capacity})` : ""}</span>
                    <input type="number" min={1} max={room?.capacity ?? 10} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={fieldCls} />
                  </label>
                </div>
                {nights > 0 && (
                  <p className="mt-4 text-sm text-charcoal">{nights} night{nights > 1 ? "s" : ""} · ₹{total.toLocaleString("en-IN")} total</p>
                )}
              </div>
            )}

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
                      <textarea placeholder="Special requests (optional)" rows={3} value={requests} onChange={(e) => setRequests(e.target.value)} className={`${fieldCls} sm:col-span-2`} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && room && (
              <div>
                <h2 className="font-display text-2xl text-charcoal">Review & pay</h2>
                <div className="mt-6 space-y-3 text-sm">
                  <Row label="Room" value={room.name} />
                  <Row label="Check-in" value={checkIn} />
                  <Row label="Check-out" value={checkOut} />
                  <Row label="Nights" value={String(nights)} />
                  <Row label="Guests" value={String(guests)} />
                  <Row label="Guest" value={name} />
                  <Row label="Phone" value={phone} />
                  {requests && <Row label="Requests" value={requests} />}
                </div>
                <button onClick={pay} disabled={paying} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-4 text-sm font-medium uppercase tracking-[0.2em] text-ivory transition hover:bg-gold disabled:opacity-60">
                  {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Pay ₹{total.toLocaleString("en-IN")} securely
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
                    if (step === 1 && !roomId) return toast.error("Please select a room");
                    if (step === 2 && nights <= 0) return toast.error("Please choose valid dates");
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
            {room ? (
              <>
                <div className="h-36 overflow-hidden rounded-xl bg-beige">
                  {room.images?.[0] && <img src={room.images[0]} alt={room.name} className="h-full w-full object-cover" />}
                </div>
                <h3 className="mt-4 font-display text-xl text-charcoal">{room.name}</h3>
                <p className="flex items-center gap-1 text-xs text-gold"><Star className="h-3.5 w-3.5 fill-gold" /> Premium accommodation</p>
                <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between text-muted-foreground"><span>₹{Number(room.price).toLocaleString("en-IN")} × {nights || 0} nights</span><span>₹{total.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between font-display text-lg text-charcoal"><span>Total</span><span className="text-gold">₹{total.toLocaleString("en-IN")}</span></div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
                <BedDouble className="h-8 w-8 text-gold" />
                <p className="mt-3 text-sm">Select a room to see your summary.</p>
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
