import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";

const itemSchema = z.object({
  roomId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20).default(1),
  adults: z.number().int().min(1).max(200).default(1),
  children: z.number().int().min(0).max(200).default(0),
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
        if (!creds)
          return Response.json({ error: "Payment gateway not configured" }, { status: 500 });
        const keySecret = creds.keySecret;

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid body" }, { status: 400 });
        }
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

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Find the pending booking
        const { data: booking, error: bErr } = await supabaseAdmin
          .from("bookings")
          .select("*, booking_rooms(*)")
          .eq("razorpay_order_id", d.razorpay_order_id)
          .single();

        if (bErr || !booking) {
          return Response.json({ error: "Booking order not found" }, { status: 404 });
        }

        // Idempotency
        if (booking.status === "confirmed") {
          return Response.json({ ok: true, bookingId: booking.id });
        }

        // Mark as confirmed
        const { error: updErr } = await supabaseAdmin
          .from("bookings")
          .update({
            status: "confirmed",
            payment_status: "paid",
            razorpay_payment_id: d.razorpay_payment_id,
          })
          .eq("id", booking.id);

        if (updErr) {
          console.error("Booking update error", updErr);
          return Response.json({ error: "Could not confirm booking" }, { status: 500 });
        }

        // Send confirmation emails (best-effort)
        try {
          const { notify } = await import("@/lib/notifications.server");
          await notify({
            type: "booking",
            title: `New paid booking — ${booking.guest_name}`,
            body: `${booking.room_type} · ${booking.check_in} → ${booking.check_out} · ₹${Number(booking.amount).toLocaleString("en-IN")}`,
            link: "/admin/bookings",
          });
        } catch (e) {
          console.error("notify error", e);
        }

        try {
          const { sendEmails, adminEmail } = await import("@/lib/email.server");
          const t = await import("@/lib/email-templates");
          const roomsBreakdown = (booking.booking_rooms || [])
            .map(
              (l: any) =>
                `${l.room_type} ×${l.quantity} (${l.adults} adult${l.adults > 1 ? "s" : ""}${l.children ? `, ${l.children} child` : ""}${l.extra_bed ? ", extra bed" : ""}) — ₹${Number(l.price).toLocaleString("en-IN")}`,
            )
            .join("; ");

          const taxRate = 0.05;
          const grandTotal = Number(booking.amount);
          const subtotal = Math.round(grandTotal / (1 + taxRate));
          const taxes = grandTotal - subtotal;

          const data = {
            name: booking.guest_name,
            email: booking.guest_email,
            phone: booking.guest_phone,
            checkIn: booking.check_in,
            checkOut: booking.check_out,
            guests: String(booking.guests),
            roomType: booking.room_type,
            requests: `${booking.special_requests ?? ""}${booking.special_requests ? " · " : ""}Rooms: ${roomsBreakdown} · Subtotal ₹${subtotal.toLocaleString("en-IN")} + GST ₹${taxes.toLocaleString("en-IN")} = ₹${grandTotal.toLocaleString("en-IN")} (${booking.nights} night${booking.nights > 1 ? "s" : ""}) · Payment ID ${d.razorpay_payment_id}`,
          };
          await sendEmails([
            {
              to: booking.guest_email,
              subject: "Booking confirmed — Nice Hotel & Restaurant",
              html: t.bookingGuestEmail(data),
            },
            {
              to: adminEmail(),
              subject: `New paid booking: ${booking.guest_name}`,
              html: t.bookingAdminEmail(data),
              reply: booking.guest_email,
            },
          ]);
        } catch (e) {
          console.error("Booking email error", e);
        }

        return Response.json({ ok: true, bookingId: booking.id });
      },
    },
  },
});
