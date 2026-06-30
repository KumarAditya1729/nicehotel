import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const schema = z.object({
  roomId: z.string().uuid(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const Route = createFileRoute("/api/public/razorpay/order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
          return Response.json({ error: "Payment gateway not configured" }, { status: 500 });
        }
        let body: unknown;
        try { body = await request.json(); } catch { return Response.json({ error: "Invalid body" }, { status: 400 }); }
        const parsed = schema.safeParse(body);
        if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

        const { computeQuote } = await import("@/lib/booking.server");
        let quote;
        try { quote = await computeQuote(parsed.data.roomId, parsed.data.checkIn, parsed.data.checkOut); }
        catch (e: any) { return Response.json({ error: e?.message ?? "Quote failed" }, { status: 400 }); }

        const amountPaise = Math.round(quote.amountInr * 100);
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const res = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Basic ${auth}` },
          body: JSON.stringify({
            amount: amountPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: { roomId: parsed.data.roomId, checkIn: parsed.data.checkIn, checkOut: parsed.data.checkOut },
          }),
        });
        if (!res.ok) {
          const txt = await res.text();
          console.error("Razorpay order error", txt);
          return Response.json({ error: "Could not create payment order" }, { status: 502 });
        }
        const order = await res.json();
        return Response.json({
          orderId: order.id,
          amount: amountPaise,
          currency: "INR",
          keyId,
          nights: quote.nights,
          roomName: quote.room.name,
          amountInr: quote.amountInr,
        });
      },
    },
  },
});
