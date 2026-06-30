import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const bookingSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().min(3).max(40),
  checkIn: z.string().max(40).optional(),
  checkOut: z.string().max(40).optional(),
  guests: z.string().max(10).optional(),
  roomType: z.string().max(80).optional(),
  requests: z.string().max(2000).optional(),
});

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  message: z.string().min(1).max(2000),
});

const venueSchema = z.object({
  venue: z.string().max(120).optional(),
  eventType: z.string().min(1).max(80),
  eventDate: z.string().min(1).max(40),
  guests: z.string().min(1).max(20),
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().min(3).max(40),
  requests: z.string().max(2000).optional(),
});

const receiptSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  amount: z.string().min(1).max(40),
  reference: z.string().max(120).optional(),
  description: z.string().max(500).optional(),
});

export const sendBookingEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => bookingSchema.parse(d))
  .handler(async ({ data }) => {
    const { sendEmails, adminEmail } = await import("./email.server");
    const t = await import("./email-templates");
    await sendEmails([
      { to: data.email, subject: "Your reservation request — Nice Hotel & Restaurant", html: t.bookingGuestEmail(data) },
      { to: adminEmail(), subject: `New booking: ${data.name}`, html: t.bookingAdminEmail(data), reply: data.email },
    ]);
    return { ok: true };
  });

export const sendContactEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    // 1) Persist the enquiry first so a message is never lost, even if email fails.
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await (supabaseAdmin as any).from("enquiries").insert({
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        subject: "Website contact form",
        message: data.message,
        status: "pending",
      });
    } catch (e) {
      console.error("Enquiry save error", e);
    }
    // 2) Send notification emails (best-effort — failure must not break the flow).
    try {
      const { sendEmails, adminEmail } = await import("./email.server");
      const t = await import("./email-templates");
      await sendEmails([
        { to: data.email, subject: "We received your message — Nice Hotel & Restaurant", html: t.contactGuestEmail(data) },
        { to: adminEmail(), subject: `New contact enquiry: ${data.name}`, html: t.contactAdminEmail(data), reply: data.email },
      ]);
    } catch (e) {
      console.error("Contact email error", e);
    }
    return { ok: true };
  });

export const sendPaymentReceiptEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => receiptSchema.parse(d))
  .handler(async ({ data }) => {
    const { sendEmails, adminEmail } = await import("./email.server");
    const t = await import("./email-templates");
    await sendEmails([
      { to: data.email, subject: "Payment receipt — Nice Hotel & Restaurant", html: t.paymentReceiptEmail(data) },
      { to: adminEmail(), subject: `Payment received: ${data.name}`, html: t.paymentAdminEmail(data), reply: data.email },
    ]);
    return { ok: true };
  });

export const sendVenueEnquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => venueSchema.parse(d))
  .handler(async ({ data }) => {
    const summary = [
      `Venue: ${data.venue ?? "—"}`,
      `Event type: ${data.eventType}`,
      `Event date: ${data.eventDate}`,
      `Expected guests: ${data.guests}`,
      data.requests ? `Special request: ${data.requests}` : null,
    ].filter(Boolean).join("\n");

    // 1) Persist the enquiry first so a request is never lost, even if email fails.
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await (supabaseAdmin as any).from("enquiries").insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: `Venue booking — ${data.venue ?? data.eventType}`,
        message: summary,
        status: "pending",
      });
    } catch (e) {
      console.error("Venue enquiry save error", e);
    }

    // 2) Send notification emails (best-effort — failure must not break the flow).
    try {
      const { sendEmails, adminEmail } = await import("./email.server");
      const t = await import("./email-templates");
      const guestMsg = { name: data.name, email: data.email, phone: data.phone, message: summary };
      await sendEmails([
        { to: data.email, subject: "We received your venue booking request — Nice Hotel & Restaurant", html: t.contactGuestEmail(guestMsg) },
        { to: adminEmail(), subject: `New venue booking: ${data.name} (${data.eventType})`, html: t.contactAdminEmail(guestMsg), reply: data.email },
      ]);
    } catch (e) {
      console.error("Venue enquiry email error", e);
    }
    return { ok: true };
  });
