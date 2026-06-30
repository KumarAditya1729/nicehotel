import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { unlocked?: boolean };

function sessionConfig() {
  return {
    password: process.env.SESSION_SECRET!,
    name: "nice-admin",
    maxAge: 60 * 60 * 12,
    cookie: { httpOnly: true, secure: true, sameSite: "none" as const, path: "/" },
  };
}

function matches(input: string, expected: string) {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

async function assertUnlocked() {
  const session = await useSession<AdminSession>(sessionConfig());
  if (!session.data.unlocked) throw new Error("Admin session locked");
}

const ALLOWED = new Set([
  "bookings", "rooms", "menu_categories", "menu_items", "offers",
  "enquiries", "site_settings", "services", "events", "email_logs", "notifications",
]);
function table(t: string) {
  if (!ALLOWED.has(t)) throw new Error("Unknown table");
  return t;
}

export const adminUnlock = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) throw new Error("Admin password not configured");
    if (!matches(data.password ?? "", expected)) return { ok: false as const };
    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  return { unlocked: !!session.data.unlocked };
});

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true };
});

export const adminList = createServerFn({ method: "POST" })
  .validator((d: { table: string; orderBy?: string; ascending?: boolean }) => d)
  .handler(async ({ data }) => {
    await assertUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = (supabaseAdmin as any).from(table(data.table)).select("*");
    if (data.orderBy) q = q.order(data.orderBy, { ascending: data.ascending ?? false });
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminUpsert = createServerFn({ method: "POST" })
  .validator((d: { table: string; values: Record<string, unknown>; id?: string }) => d)
  .handler(async ({ data }) => {
    await assertUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;
    if (data.id) {
      const { error } = await db.from(table(data.table)).update(data.values).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await db.from(table(data.table)).insert(data.values);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDelete = createServerFn({ method: "POST" })
  .validator((d: { table: string; id: string }) => d)
  .handler(async ({ data }) => {
    await assertUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any).from(table(data.table)).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpload = createServerFn({ method: "POST" })
  .validator((d: { filename: string; contentType: string; base64: string }) => d)
  .handler(async ({ data }) => {
    await assertUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ext = (data.filename.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bytes = Buffer.from(data.base64, "base64");
    const { error } = await (supabaseAdmin as any).storage
      .from("site-images")
      .upload(path, bytes, { contentType: data.contentType || "image/jpeg", upsert: true });
    if (error) throw new Error(error.message);
    const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
    const { data: signed, error: signErr } = await (supabaseAdmin as any).storage
      .from("site-images")
      .createSignedUrl(path, TEN_YEARS);
    if (signErr) throw new Error(signErr.message);
    return { url: signed.signedUrl as string };
  });

type CmsBlock = { label?: string; type?: "text" | "image"; value?: string };

export const adminSettingsList = createServerFn({ method: "GET" }).handler(async () => {
  await assertUnlocked();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await (supabaseAdmin as any).from("site_settings").select("*").order("key", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as { key: string; value: CmsBlock }[];
});

export const adminSettingSave = createServerFn({ method: "POST" })
  .validator((d: { key: string; value: CmsBlock }) => d)
  .handler(async ({ data }) => {
    await assertUnlocked();
    if (!data.key) throw new Error("Key is required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any)
      .from("site_settings")
      .upsert({ key: data.key, value: data.value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSettingDelete = createServerFn({ method: "POST" })
  .validator((d: { key: string }) => d)
  .handler(async ({ data }) => {
    await assertUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any).from("site_settings").delete().eq("key", data.key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminResendEmail = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    await assertUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: log, error } = await (supabaseAdmin as any)
      .from("email_logs").select("*").eq("id", data.id).single();
    if (error) throw new Error(error.message);
    if (!log) throw new Error("Email log not found");

    const { sendEmail } = await import("./email.server");
    const { renderEmail } = await import("./email-templates");
    const payload = (log.payload ?? {}) as any;
    const type = payload.type || log.type || "generic";
    const rendered = renderEmail(type, payload.data ?? {});
    const ok = await sendEmail({
      to: log.recipient,
      subject: payload.subject || log.subject || rendered.subject,
      html: rendered.html,
      type,
      payload,
    });
    return { ok };
  });

// ----- Multi-room booking management -----

// ----- Notifications -----

export const adminNotificationsMarkRead = createServerFn({ method: "POST" })
  .validator((d: { id?: string; all?: boolean }) => d)
  .handler(async ({ data }) => {
    await assertUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = (supabaseAdmin as any).from("notifications").update({ read: true });
    q = data.all ? q.eq("read", false) : q.eq("id", data.id);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminNotificationsClear = createServerFn({ method: "POST" })
  .handler(async () => {
    await assertUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any)
      .from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminBookingRooms = createServerFn({ method: "POST" })
  .validator((d: { bookingId: string }) => d)
  .handler(async ({ data }) => {
    await assertUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await (supabaseAdmin as any)
      .from("booking_rooms")
      .select("*")
      .eq("booking_id", data.bookingId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as { id: string }[];
  });

export const adminBookingRoomUpdate = createServerFn({ method: "POST" })
  .validator((d: { id: string; values: Record<string, unknown> }) => d)
  .handler(async ({ data }) => {
    await assertUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const allowed: Record<string, unknown> = {};
    for (const k of ["room_number", "notes", "quantity", "adults", "children", "extra_bed"]) {
      if (k in data.values) allowed[k] = data.values[k];
    }
    const { error } = await (supabaseAdmin as any)
      .from("booking_rooms").update(allowed).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
