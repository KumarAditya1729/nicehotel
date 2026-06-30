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
  .validator((d: unknown) => bookingSchema.parse(d))
  .handler(async ({ data }) => {
    const { sendEmails, adminEmail } = await import("./email.server");
    const t = await import("./email-templates");
    const { notify } = await import("./notifications.server");
    await notify({
      type: "booking",
      title: `New booking request — ${data.name}`,
      body: `${data.roomType ?? "Room"} · ${data.checkIn ?? "?"} → ${data.checkOut ?? "?"} · ${data.guests ?? "?"} guest(s)`,
      link: "/admin/bookings",
    });
    await sendEmails([
      { to: data.email, subject: "Your reservation request — Nice Hotel & Restaurant", html: t.bookingGuestEmail(data), type: "booking_confirmation", payload: { type: "booking_confirmation", to: data.email, data } },
      { to: adminEmail(), subject: `New booking: ${data.name}`, html: t.bookingAdminEmail(data), reply: data.email, type: "admin_alert", payload: { type: "admin_alert", to: adminEmail(), data } },
    ]);
    return { ok: true };
  });

export const sendContactEmail = createServerFn({ method: "POST" })
  .validator((d: unknown) => contactSchema.parse(d))
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
    try {
      const { notify } = await import("./notifications.server");
      await notify({
        type: "enquiry",
        title: `New contact message — ${data.name}`,
        body: data.message.slice(0, 140),
        link: "/admin/enquiries",
      });
    } catch (e) { console.error("notify error", e); }
    // 2) Send notification emails (best-effort — failure must not break the flow).
    try {
      const { sendEmails, adminEmail } = await import("./email.server");
      const t = await import("./email-templates");
      await sendEmails([
        { to: data.email, subject: "We received your message — Nice Hotel & Restaurant", html: t.contactGuestEmail(data), type: "contact", payload: { type: "contact", to: data.email, data } },
        { to: adminEmail(), subject: `New contact enquiry: ${data.name}`, html: t.contactAdminEmail(data), reply: data.email, type: "admin_alert" },
      ]);
    } catch (e) {
      console.error("Contact email error", e);
    }
    return { ok: true };
  });

export const sendPaymentReceiptEmail = createServerFn({ method: "POST" })
  .validator((d: unknown) => receiptSchema.parse(d))
  .handler(async ({ data }) => {
    const { sendEmails, adminEmail } = await import("./email.server");
    const t = await import("./email-templates");
    const { notify } = await import("./notifications.server");
    await notify({
      type: "payment",
      title: `Payment received — ${data.name}`,
      body: `₹${data.amount}${data.reference ? ` · ${data.reference}` : ""}`,
      link: "/admin/bookings",
    });
    await sendEmails([
      { to: data.email, subject: "Payment receipt — Nice Hotel & Restaurant", html: t.paymentReceiptEmail(data), type: "payment", payload: { type: "payment", to: data.email, data } },
      { to: adminEmail(), subject: `Payment received: ${data.name}`, html: t.paymentAdminEmail(data), reply: data.email, type: "admin_alert" },
    ]);
    return { ok: true };
  });

export const sendVenueEnquiry = createServerFn({ method: "POST" })
  .validator((d: unknown) => venueSchema.parse(d))
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
    try {
      const { notify } = await import("./notifications.server");
      await notify({
        type: "venue",
        title: `New venue booking — ${data.name}`,
        body: `${data.eventType} · ${data.eventDate} · ${data.guests} guests${data.venue ? ` · ${data.venue}` : ""}`,
        link: "/admin/enquiries",
      });
    } catch (e) { console.error("notify error", e); }

    // 2) Send notification emails (best-effort — failure must not break the flow).
    try {
      const { sendEmails, adminEmail } = await import("./email.server");
      const t = await import("./email-templates");
      const guestMsg = { name: data.name, email: data.email, phone: data.phone, message: summary };
      await sendEmails([
        { to: data.email, subject: "We received your venue booking request — Nice Hotel & Restaurant", html: t.contactGuestEmail(guestMsg), type: "venue", payload: { type: "venue", to: data.email, data } },
        { to: adminEmail(), subject: `New venue booking: ${data.name} (${data.eventType})`, html: t.contactAdminEmail(guestMsg), reply: data.email, type: "admin_alert" },
      ]);
    } catch (e) {
      console.error("Venue enquiry email error", e);
    }
    return { ok: true };
  });

/* ---------------------------------------------------------------- *
 * Unified dispatcher — mirrors a "send-email" edge function.        *
 * Accepts { type, to, data } and renders the right luxury template.  *
 * ---------------------------------------------------------------- */
const sendEmailSchema = z.object({
  type: z.string().min(1).max(60),
  to: z.string().email(),
  data: z.record(z.string(), z.any()).optional(),
  cc: z.string().email().optional(),
  subject: z.string().max(200).optional(),
});

export const sendEmail = createServerFn({ method: "POST" })
  .validator((d: unknown) => sendEmailSchema.parse(d))
  .handler(async ({ data }) => {
    const { sendEmail: send } = await import("./email.server");
    const { renderEmail } = await import("./email-templates");
    const rendered = renderEmail(data.type, data.data ?? {});
    const ok = await send({
      to: data.to,
      subject: data.subject || rendered.subject,
      html: rendered.html,
      type: data.type,
      payload: { type: data.type, to: data.to, data: data.data ?? {}, subject: data.subject },
    });
    return { ok };
  });

const newsletterSchema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(20000),
  title: z.string().max(200).optional(),
  recipients: z.array(z.string().email()).min(1).max(2000),
  ctaUrl: z.string().max(300).optional(),
  ctaLabel: z.string().max(60).optional(),
});

export const sendNewsletter = createServerFn({ method: "POST" })
  .validator((d: unknown) => newsletterSchema.parse(d))
  .handler(async ({ data }) => {
    const { sendEmail: send } = await import("./email.server");
    const { renderEmail } = await import("./email-templates");
    let sent = 0;
    for (const to of data.recipients) {
      const r = renderEmail("newsletter", {
        subject: data.subject, title: data.title, body: data.body,
        ctaUrl: data.ctaUrl, ctaLabel: data.ctaLabel,
      });
      const ok = await send({
        to, subject: data.subject, html: r.html, type: "newsletter",
        payload: { type: "newsletter", to, data: { ...data, recipients: undefined } },
      });
      if (ok) sent += 1;
    }
    return { ok: true, sent, total: data.recipients.length };
  });
