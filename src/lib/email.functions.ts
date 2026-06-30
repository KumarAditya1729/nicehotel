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
    const { sendEmails, adminEmail } = await import("./email.server");
    const t = await import("./email-templates");
    await sendEmails([
      { to: data.email, subject: "We received your message — Nice Hotel & Restaurant", html: t.contactGuestEmail(data) },
      { to: adminEmail(), subject: `New contact enquiry: ${data.name}`, html: t.contactAdminEmail(data), reply: data.email },
    ]);
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
