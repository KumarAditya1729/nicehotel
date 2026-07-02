import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const itemSchema = z.object({
  roomId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20).default(1),
  adults: z.number().int().min(1).max(200).default(1),
  children: z.number().int().min(0).max(200).default(0),
  extraBed: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
});
const schema = z.object({
  // New multi-room shape
  items: z.array(itemSchema).min(1).max(30).optional(),
  // Legacy single-room shape
  roomId: z.string().uuid().optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(60),
  guestName: z.string().min(1).max(120),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(3).max(40),
  specialRequests: z.string().max(2000).optional(),
});

export const Route = createFileRoute("/api/public/razorpay/order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { razorpayCreds } = await import("@/lib/razorpay.server");
        const creds = razorpayCreds();
        if (!creds) {
          return Response.json({ error: "Payment gateway not configured" }, { status: 500 });
        }
        const { keyId, keySecret } = creds;
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid body" }, { status: 400 });
        }
        const parsed = schema.safeParse(body);
        if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
        const d = parsed.data;
        const { checkIn, checkOut } = d;
        const items =
          d.items ??
          (d.roomId
            ? [{ roomId: d.roomId, quantity: 1, adults: 1, children: 0, extraBed: false }]
            : null);
        if (!items) return Response.json({ error: "No rooms selected" }, { status: 400 });

        const { computeMultiQuote, assertMultiAvailable } = await import("@/lib/booking.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Resolve user
        let userId: string | null = null;
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.toLowerCase().startsWith("bearer ") ? authHeader.slice(7) : null;
        if (token) {
          try {
            const { data: u } = await supabaseAdmin.auth.getUser(token);
            userId = u?.user?.id ?? null;
          } catch {
            userId = null;
          }
        }
        let quote;
        try {
          quote = await computeMultiQuote(items, checkIn, checkOut);
        } catch (e: unknown) {
          return Response.json(
            { error: e instanceof Error ? e.message : "Quote failed" },
            { status: 400 },
          );
        }

        try {
          await assertMultiAvailable(items, checkIn, checkOut);
        } catch (e: unknown) {
          return Response.json(
            { error: e instanceof Error ? e.message : "Not available" },
            { status: 409 },
          );
        }

        const amountPaise = Math.round(quote.grandTotal * 100);
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const res = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Basic ${auth}` },
          body: JSON.stringify({
            amount: amountPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: { rooms: String(items.length), checkIn, checkOut },
          }),
        });
        if (!res.ok) {
          const txt = await res.text();
          console.error("Razorpay order error", txt);
          return Response.json({ error: "Could not create payment order" }, { status: 502 });
        }
        const order = await res.json();

        // Create pending booking in DB
        const totalGuests = d.guests;
        const first = quote.lines[0];
        const roomSummary = quote.lines.map((l) => `${l.room.name} ×${l.quantity}`).join(", ");

        const { data: booking, error } = await supabaseAdmin
          .from("bookings")
          .insert({
            user_id: userId,
            guest_name: d.guestName,
            guest_email: d.guestEmail,
            guest_phone: d.guestPhone,
            room_id: first.room.id,
            room_type: quote.lines.length === 1 ? first.room.name : roomSummary,
            check_in: checkIn,
            check_out: checkOut,
            nights: quote.nights,
            guests: totalGuests,
            amount: quote.grandTotal,
            status: "pending",
            payment_status: "unpaid",
            source: "website",
            special_requests: d.specialRequests ?? null,
            razorpay_order_id: order.id,
          })
          .select("id")
          .single();

        if (!error && booking) {
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
            await supabaseAdmin.from("booking_rooms").insert(rows);
          } catch (e) {
            console.error("booking_rooms insert error", e);
          }
        }

        const roomName =
          quote.lines.length === 1
            ? `${quote.lines[0].room.name}${quote.lines[0].quantity > 1 ? ` ×${quote.lines[0].quantity}` : ""}`
            : `${quote.lines.reduce((s, l) => s + l.quantity, 0)} rooms`;
        return Response.json({
          orderId: order.id,
          amount: amountPaise,
          currency: "INR",
          keyId,
          nights: quote.nights,
          roomName,
          subtotal: quote.subtotal,
          taxes: quote.taxes,
          amountInr: quote.grandTotal,
        });
      },
    },
  },
});
