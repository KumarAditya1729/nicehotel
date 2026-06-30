import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";

const itemSchema = z.object({
  roomId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20).default(1),
  adults: z.number().int().min(1).max(20).default(1),
  children: z.number().int().min(0).max(20).default(0),
  extraBed: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
});
const schema = z.object({
  razorpay_order_id: z.string().min(3),
  razorpay_payment_id: z.string().min(3),
  razorpay_signature: z.string().min(3),
  items: z.array(itemSchema).min(1).max(30).optional(),
  roomId: z.string().uuid().optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(60),
  guestName: z.string().min(1).max(120),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(3).max(40),
  specialRequests: z.string().max(2000).optional(),
});

export const Route = createFileRoute("/api/public/razorpay/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { razorpayCreds } = await import("@/lib/razorpay.server");
        const creds = razorpayCreds();
        if (!creds) return Response.json({ error: "Payment gateway not configured" }, { status: 500 });
        const keySecret = creds.keySecret;

        let body: unknown;
        try { body = await request.json(); } catch { return Response.json({ error: "Invalid body" }, { status: 400 }); }
        const parsed = schema.safeParse(body);
        if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
        const d = parsed.data;

        // Verify signature
        const expected = createHmac("sha256", keySecret)
          .update(`${d.razorpay_order_id}|${d.razorpay_payment_id}`)
          .digest("hex");
        const sig = Buffer.from(d.razorpay_signature);
        const exp = Buffer.from(expected);
        if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
          return Response.json({ error: "Payment verification failed" }, { status: 400 });
        }

        const { computeMultiQuote, assertMultiAvailable, findExistingBooking } = await import("@/lib/booking.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const items = d.items ?? (d.roomId
          ? [{ roomId: d.roomId, quantity: 1, adults: d.guests, children: 0, extraBed: false }]
          : null);
        if (!items) return Response.json({ error: "No rooms selected" }, { status: 400 });

        // Idempotency: if this payment already produced a booking, return it.
        try {
          const existing = await findExistingBooking(d.razorpay_order_id, d.razorpay_payment_id);
          if (existing) return Response.json({ ok: true, bookingId: existing });
        } catch { /* non-fatal: continue to insert */ }

        // Resolve the authenticated user from the bearer token (never trust client userId).
        let userId: string | null = null;
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.toLowerCase().startsWith("bearer ") ? authHeader.slice(7) : null;
        if (token) {
          try {
            const { data: u } = await (supabaseAdmin as any).auth.getUser(token);
            userId = u?.user?.id ?? null;
          } catch { userId = null; }
        }

        let quote;
        try { quote = await computeMultiQuote(items as any, d.checkIn, d.checkOut); }
        catch (e: any) { return Response.json({ error: e?.message ?? "Quote failed" }, { status: 400 }); }

        try { await assertMultiAvailable(items as any, d.checkIn, d.checkOut); }
        catch (e: any) { return Response.json({ error: e?.message ?? "Not available", paymentId: d.razorpay_payment_id }, { status: 409 }); }

        const totalGuests = quote.lines.reduce((s, l) => s + (l.adults + l.children) * l.quantity, 0) || d.guests;
        const first = quote.lines[0];
        const roomSummary = quote.lines
          .map((l) => `${l.room.name} ×${l.quantity}`)
          .join(", ");

        const { data: booking, error } = await (supabaseAdmin as any)
          .from("bookings")
          .insert({
            user_id: userId,
            guest_name: d.guestName,
            guest_email: d.guestEmail,
            guest_phone: d.guestPhone,
            room_id: first.room.id,
            room_type: quote.lines.length === 1 ? first.room.name : roomSummary,
            check_in: d.checkIn,
            check_out: d.checkOut,
            nights: quote.nights,
            guests: totalGuests,
            amount: quote.grandTotal,
            status: "confirmed",
            payment_status: "paid",
            source: "website",
            special_requests: d.specialRequests ?? null,
            razorpay_order_id: d.razorpay_order_id,
            razorpay_payment_id: d.razorpay_payment_id,
          })
          .select("id")
          .single();
        if (error) {
          console.error("Booking insert error", error);
          return Response.json({ error: "Could not save booking" }, { status: 500 });
        }

        // Insert child room lines
        try {
          const rows = quote.lines.map((l) => ({
            booking_id: booking.id,
            room_id: l.room.id,
            room_type: l.room.name,
            quantity: l.quantity,
            adults: l.adults,
            children: l.children,
            extra_bed: l.extraBed,
            unit_price: l.unitPrice,
            price: l.lineTotal,
            notes: l.notes,
          }));
          await (supabaseAdmin as any).from("booking_rooms").insert(rows);
        } catch (e) {
          console.error("booking_rooms insert error", e);
        }

        // Send confirmation emails (best-effort)
        try {
          const { sendEmails, adminEmail } = await import("@/lib/email.server");
          const t = await import("@/lib/email-templates");
          const roomsBreakdown = quote.lines
            .map((l) => `${l.room.name} ×${l.quantity} (${l.adults} adult${l.adults > 1 ? "s" : ""}${l.children ? `, ${l.children} child` : ""}${l.extraBed ? ", extra bed" : ""}) — ₹${l.lineTotal.toLocaleString("en-IN")}`)
          .join("; ");
          const data = {
            name: d.guestName, email: d.guestEmail, phone: d.guestPhone,
            checkIn: d.checkIn, checkOut: d.checkOut, guests: String(totalGuests),
            roomType: quote.lines.length === 1 ? first.room.name : roomSummary,
            requests: `${d.specialRequests ?? ""}${d.specialRequests ? " · " : ""}Rooms: ${roomsBreakdown} · Subtotal ₹${quote.subtotal.toLocaleString("en-IN")} + GST ₹${quote.taxes.toLocaleString("en-IN")} = ₹${quote.grandTotal.toLocaleString("en-IN")} (${quote.nights} night${quote.nights > 1 ? "s" : ""}) · Payment ID ${d.razorpay_payment_id}`,
          };
          await sendEmails([
            { to: d.guestEmail, subject: "Booking confirmed — Nice Hotel & Restaurant", html: t.bookingGuestEmail(data) },
            { to: adminEmail(), subject: `New paid booking: ${d.guestName}`, html: t.bookingAdminEmail(data), reply: d.guestEmail },
          ]);
        } catch (e) {
          console.error("Booking email error", e);
        }

        return Response.json({ ok: true, bookingId: booking.id });
      },
    },
  },
});
