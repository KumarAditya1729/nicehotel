import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

export const Route = createFileRoute("/api/public/razorpay/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { razorpayCreds } = await import("@/lib/razorpay.server");
        const creds = razorpayCreds();
        if (!creds || !creds.webhookSecret) {
          return Response.json({ error: "Webhook not configured" }, { status: 500 });
        }

        const signature = request.headers.get("x-razorpay-signature");
        if (!signature) {
          return Response.json({ error: "Missing signature" }, { status: 400 });
        }

        const rawBody = await request.text();
        const expected = createHmac("sha256", creds.webhookSecret).update(rawBody).digest("hex");

        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expected);
        if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
          return Response.json({ error: "Invalid signature" }, { status: 400 });
        }

        const payload = JSON.parse(rawBody);
        const event = payload.event;
        if (event === "payment.captured" || event === "order.paid") {
          const payment = payload.payload.payment.entity;
          const orderId = payment.order_id;
          const paymentId = payment.id;

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // Find the pending booking
          const { data: booking, error: bErr } = await supabaseAdmin
            .from("bookings")
            .select("*, booking_rooms(*)")
            .eq("razorpay_order_id", orderId)
            .single();

          if (bErr || !booking) {
            return Response.json({ error: "Booking order not found" }, { status: 404 });
          }

          // Idempotency
          if (booking.status === "confirmed") {
            return Response.json({ ok: true });
          }

          // Mark as confirmed
          const { error: updErr } = await supabaseAdmin
            .from("bookings")
            .update({
              status: "confirmed",
              payment_status: "paid",
              razorpay_payment_id: paymentId,
            })
            .eq("id", booking.id);

          if (updErr) {
            console.error("Booking webhook update error", updErr);
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
              requests: `${booking.special_requests ?? ""}${booking.special_requests ? " · " : ""}Rooms: ${roomsBreakdown} · Subtotal ₹${subtotal.toLocaleString("en-IN")} + GST ₹${taxes.toLocaleString("en-IN")} = ₹${grandTotal.toLocaleString("en-IN")} (${booking.nights} night${booking.nights > 1 ? "s" : ""}) · Payment ID ${paymentId}`,
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
        }

        return Response.json({ ok: true });
      },
    },
  },
});
