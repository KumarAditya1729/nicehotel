import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { site, roomTypes } from "@/data/content";
import { useServerFn } from "@tanstack/react-start";
import { sendBookingEmail } from "@/lib/email.functions";

type Ctx = { open: (room?: string) => void };
const BookingCtx = createContext<Ctx>({ open: () => {} });
export const useBooking = () => useContext(BookingCtx);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [room, setRoom] = useState<string>("");
  const [sending, setSending] = useState(false);
  const submitBooking = useServerFn(sendBookingEmail);

  const open = (r?: string) => {
    setRoom(r ?? "");
    setOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    setSending(true);
    try {
      await submitBooking({
        data: {
          name: String(fd.get("name") || ""),
          phone: String(fd.get("phone") || ""),
          email: String(fd.get("email") || ""),
          checkIn: String(fd.get("checkIn") || ""),
          checkOut: String(fd.get("checkOut") || ""),
          guests: String(fd.get("guests") || ""),
          roomType: room,
          requests: String(fd.get("requests") || ""),
        },
      });
      setOpen(false);
      form.reset();
      setRoom("");
      toast.success("Reservation request received", {
        description: `Thank you — a confirmation email is on its way. Our team will confirm shortly at ${site.phone}.`,
      });
    } catch {
      toast.error("Could not send your request", {
        description: `Please call us at ${site.phone} and we'll assist you right away.`,
      });
    } finally {
      setSending(false);
    }
  };

  const field =
    "w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30";

  return (
    <BookingCtx.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog" aria-modal="true" aria-label="Book your stay"
              className="glass relative z-10 w-full max-w-lg rounded-2xl p-7 shadow-luxe max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close booking form"
                className="absolute right-5 top-5 text-muted-foreground transition hover:text-gold"
              >
                <X className="h-5 w-5" />
              </button>
              <p className="eyebrow">Reservations</p>
              <h3 className="mt-2 font-display text-3xl text-charcoal">Book Your Stay</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Share your details and our concierge will confirm availability.
              </p>
              <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input required name="name" placeholder="Full Name" className={field} aria-label="Full name" />
                <input required name="phone" placeholder="Phone" className={field} aria-label="Phone" />
                <input required name="email" type="email" placeholder="Email" className={`${field} sm:col-span-2`} aria-label="Email" />
                <label className="text-xs text-muted-foreground sm:col-span-1">
                  Check-in
                  <input required name="checkIn" type="date" className={`${field} mt-1`} aria-label="Check-in date" />
                </label>
                <label className="text-xs text-muted-foreground sm:col-span-1">
                  Check-out
                  <input required name="checkOut" type="date" className={`${field} mt-1`} aria-label="Check-out date" />
                </label>
                <input name="guests" type="number" min={1} defaultValue={2} placeholder="Guests" className={field} aria-label="Guests" />
                <select name="roomType" className={field} value={room} onChange={(e) => setRoom(e.target.value)} aria-label="Room type">
                  <option value="">Room Type</option>
                  {roomTypes.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <textarea name="requests" placeholder="Special Requests" rows={2} className={`${field} sm:col-span-2`} aria-label="Special requests" />
                <button
                  type="submit"
                  disabled={sending}
                  className="sm:col-span-2 mt-1 rounded-full bg-charcoal px-6 py-3.5 text-sm font-medium uppercase tracking-[0.2em] text-ivory transition hover:bg-gold disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Request Reservation"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BookingCtx.Provider>
  );
}
