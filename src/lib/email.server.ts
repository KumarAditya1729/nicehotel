/**
 * Email sending layer.
 *
 * NOTE: No email provider is wired up right now. The previous implementation
 * used `worker-mailer` (which requires `cloudflare:sockets`) and would not
 * build/run off Cloudflare Workers. It has been removed so the app builds on
 * any host. Sends are recorded in `email_logs` as "skipped" so booking /
 * contact / venue flows continue uninterrupted and a real provider
 * (Lovable email, Nodemailer, an HTTP API, etc.) can be added later without
 * touching call sites.
 */

const FROM_NAME = process.env.HOTEL_NAME || "Nice Hotel & Restaurant";

export function adminEmail() {
  return process.env.ADMIN_EMAIL || process.env.GMAIL_USER || process.env.SMTP_USER || "";
}

export type Message = {
  to: string | string[];
  subject: string;
  html: string;
  reply?: string;
  /** Email category for logging (e.g. booking_confirmation, contact_form). */
  type?: string;
  /** Re-render payload stored on the log row so a failed email can be resent. */
  payload?: Record<string, unknown> | null;
};

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

async function logMessage(m: Message, status: string, error_message: string | null) {
  try {
    const client = await db();
    await client.from("email_logs").insert({
      recipient: String(m.to),
      subject: m.subject,
      type: m.type ?? "generic",
      status,
      error_message,
      payload: m.payload ?? null,
    });
  } catch (e) {
    console.error("email_logs insert failed", e);
  }
}

/**
 * Records the email and returns false (nothing is actually sent yet).
 * Never throws — callers stay resilient so the booking / contact flow is
 * never broken by email handling.
 */
export async function sendEmail(m: Message): Promise<boolean> {
  void FROM_NAME;
  await logMessage(m, "skipped", "No email provider configured");
  return false;
}

/** Record a batch of emails; best-effort, each logged independently. */
export async function sendEmails(messages: Message[]) {
  const results = await Promise.all(messages.map((m) => sendEmail(m)));
  return { ok: results.every(Boolean), sent: results.filter(Boolean).length, total: messages.length };
}
