import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";

const schema = z.object({
  razorpay_order_id: z.string().min(3),
  razorpay_payment_id: z.string().min(3),
  razorpay_signature: z.string().min(3),
  roomId: z.string().uuid(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(20),
  guestName: z.string().min(1).max(120),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(3).max(40),
  specialRequests: z.string().max(2000).optional(),
  userId: z.string().uuid().optional(),
});

export const Route = createFileRoute("/api/public/razorpay/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) return Response.json({ error: "Payment gateway not configured" }, { status: 500 });

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

        const { computeQuote } = await import("@/lib/booking.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let quote;
        try { quote = await computeQuote(d.roomId, d.checkIn, d.checkOut); }
        catch (e: any) { return Response.json({ error: e?.message ?? "Quote failed" }, { status: 400 }); }

        const { data: booking, error } = await (supabaseAdmin as any)
          .from("bookings")
          .insert({
            user_id: d.userId ?? null,
            guest_name: d.guestName,
            guest_email: d.guestEmail,
            guest_phone: d.guestPhone,
            room_id: d.roomId,
            room_type: quote.room.name,
            check_in: d.checkIn,
            check_out: d.checkOut,
            nights: quote.nights,
            guests: d.guests,
            amount: quote.amountInr,
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

        // Send confirmation emails (best-effort)
        try {
          const { sendEmails, adminEmail } = await import("@/lib/email.server");
          const t = await import("@/lib/email-templates");
          const data = {
            name: d.guestName, email: d.guestEmail, phone: d.guestPhone,
            checkIn: d.checkIn, checkOut: d.checkOut, guests: String(d.guests),
            roomType: quote.room.name,
            requests: `${d.specialRequests ?? ""}${d.specialRequests ? " · " : ""}Paid ₹${quote.amountInr.toLocaleString("en-IN")} (${quote.nights} night${quote.nights > 1 ? "s" : ""}) · Payment ID ${d.razorpay_payment_id}`,
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
