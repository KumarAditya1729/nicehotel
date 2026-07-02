// Normalizes Razorpay credentials regardless of which env var holds the
// public key id (rzp_...) vs the secret. Returns canonical { keyId, keySecret }.
export function razorpayCreds(): { keyId: string; keySecret: string; webhookSecret: string } | null {
  const a = process.env.RAZORPAY_KEY_ID ?? "";
  const b = process.env.RAZORPAY_KEY_SECRET ?? "";
  const w = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
  if (!a || !b) return null;
  // The key id always starts with "rzp_"; the secret never does.
  if (a.startsWith("rzp_")) return { keyId: a, keySecret: b, webhookSecret: w };
  if (b.startsWith("rzp_")) return { keyId: b, keySecret: a, webhookSecret: w };
  // Fallback to declared roles.
  return { keyId: a, keySecret: b, webhookSecret: w };
}
