import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { unlocked?: boolean };

function sessionConfig() {
  return {
    password: process.env.SESSION_SECRET!,
    name: "nice-admin",
    maxAge: 60 * 60 * 12,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
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
  "enquiries", "reviews", "gallery", "profiles", "user_roles", "audit_logs", "site_settings",
  "services", "events",
]);
function table(t: string) {
  if (!ALLOWED.has(t)) throw new Error("Unknown table");
  return t;
}

export const adminUnlock = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
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
  .inputValidator((d: { table: string; orderBy?: string; ascending?: boolean }) => d)
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
  .inputValidator((d: { table: string; values: Record<string, unknown>; id?: string }) => d)
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
  .inputValidator((d: { table: string; id: string }) => d)
  .handler(async ({ data }) => {
    await assertUnlocked();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await (supabaseAdmin as any).from(table(data.table)).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
