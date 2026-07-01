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
        try { body = await request.json(); } catch { return Response.json({ error: "Invalid body" }, { status: 400 }); }
        const parsed = schema.safeParse(body);
        if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
        const { checkIn, checkOut } = parsed.data;
        const items = parsed.data.items ?? (parsed.data.roomId
          ? [{ roomId: parsed.data.roomId, quantity: 1, adults: 1, children: 0, extraBed: false }]
          : null);
        if (!items) return Response.json({ error: "No rooms selected" }, { status: 400 });

        const { computeMultiQuote, assertMultiAvailable } = await import("@/lib/booking.server");
        let quote;
        try { quote = await computeMultiQuote(items as any, checkIn, checkOut); }
        catch (e: any) { return Response.json({ error: e?.message ?? "Quote failed" }, { status: 400 }); }

        try { await assertMultiAvailable(items as any, checkIn, checkOut); }
        catch (e: any) { return Response.json({ error: e?.message ?? "Not available" }, { status: 409 }); }

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
        const roomName = quote.lines.length === 1
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
