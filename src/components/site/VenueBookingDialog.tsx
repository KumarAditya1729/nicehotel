import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { sendVenueEnquiry } from "@/lib/email.functions";

const EVENT_TYPES = [
  "Wedding",
  "Kitty Party",
  "Birthday Party",
  "Social Gathering",
  "Corporate Event",
  "Meeting / Training",
  "Other",
];

const field =
  "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-charcoal outline-none transition focus:border-gold";
const labelCls = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-brown";

export function VenueBookingDialog({ venue, onClose }: { venue: string | null; onClose: () => void }) {
  const submit = useServerFn(sendVenueEnquiry);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      venue: venue ?? undefined,
      eventType: String(fd.get("eventType") || ""),
      eventDate: String(fd.get("eventDate") || ""),
      guests: String(fd.get("guests") || ""),
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      requests: String(fd.get("requests") || "") || undefined,
    };
    setLoading(true);
    try {
      await submit({ data: payload });
      toast.success("Booking request sent! Our team will contact you shortly.");
      onClose();
    } catch {
      toast.error("Could not send your request. Please call +91 9216400005.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={venue !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-charcoal">Book {venue}</DialogTitle>
          <DialogDescription>Share your event details and we'll get back to you. No payment required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div>
            <label className={labelCls} htmlFor="eventType">Event Type</label>
            <select id="eventType" name="eventType" required className={field} defaultValue="">
              <option value="" disabled>Select event type</option>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="eventDate">Event Date</label>
              <input id="eventDate" name="eventDate" type="date" required className={field} />
            </div>
            <div>
              <label className={labelCls} htmlFor="guests">Expected Guests</label>
              <input id="guests" name="guests" type="number" min={1} required placeholder="e.g. 50" className={field} />
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="name">Full Name</label>
            <input id="name" name="name" required placeholder="Your full name" className={field} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required placeholder="you@email.com" className={field} />
            </div>
            <div>
              <label className={labelCls} htmlFor="phone">Phone Number</label>
              <input id="phone" name="phone" required placeholder="+91 ..." className={field} />
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="requests">Special Request</label>
            <textarea id="requests" name="requests" rows={3} placeholder="Catering, decor, timings..." className={field} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-charcoal px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition hover:bg-gold disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Booking Request"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}