/**
 * Admin in-app notification helper (server-only).
 * Records site actions into `public.notifications` so the admin panel shows a
 * live activity feed. Best-effort: never throws so it can't break a user flow.
 */
export type NotifyInput = {
  type: string;
  title: string;
  body?: string;
  link?: string;
};

export async function notify(input: NotifyInput): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await (supabaseAdmin as any).from("notifications").insert({
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    });
  } catch (e) {
    console.error("notify() failed", e);
  }
}
