import { createServerFn } from "@tanstack/react-start";

async function publicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const getRooms = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await publicClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id,name,room_number,category,description,price,weekend_price,capacity,floor,amenities,images,status,sort_order,total_units")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

/**
 * Live room availability. For each active room type it returns how many units
 * are free for the given date range, derived from real bookings that overlap
 * those dates (cancelled bookings are ignored). Defaults to tonight's stay.
 */
export const getRoomAvailability = createServerFn({ method: "GET" })
  .inputValidator((data?: { checkIn?: string; checkOut?: string }) => data ?? {})
  .handler(async ({ data }) => {
    const supabase = await publicClient();

    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const checkIn = data?.checkIn || today;
    const checkOut = data?.checkOut || tomorrow;

    const { data: rooms, error: rErr } = await supabase
      .from("rooms")
      .select("id,name,category,total_units")
      .eq("is_active", true);
    if (rErr) throw new Error(rErr.message);

    // Bookings that overlap the requested range: check_in < checkOut AND check_out > checkIn
    const { data: bookings, error: bErr } = await supabase
      .from("bookings")
      .select("room_id,room_type,status,check_in,check_out")
      .neq("status", "cancelled")
      .lt("check_in", checkOut)
      .gt("check_out", checkIn);
    if (bErr) throw new Error(bErr.message);

    return (rooms ?? []).map((room: any) => {
      const booked = (bookings ?? []).filter((b: any) => {
        if (b.room_id) return b.room_id === room.id;
        const t = (b.room_type ?? "").toLowerCase();
        return t === (room.name ?? "").toLowerCase() || t === (room.category ?? "").toLowerCase();
      }).length;
      const total = Number(room.total_units) || 0;
      const available = Math.max(0, total - booked);
      return { roomId: room.id, name: room.name, category: room.category, total, booked, available };
    });
  });

export const getOffers = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await publicClient();
  const { data, error } = await supabase
    .from("offers")
    .select("id,title,description,type,code,discount,image")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getServices = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await publicClient();
  const { data, error } = await supabase
    .from("services")
    .select("id,title,description,group_name,icon,tags,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getEvents = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await publicClient();
  const { data, error } = await supabase
    .from("events")
    .select("id,name,subtitle,badge,description,capacity,size,floor,price,image,amenities,coming_soon,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getMenu = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await publicClient();
  const { data: cats, error: cErr } = await supabase
    .from("menu_categories")
    .select("id,name,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (cErr) throw new Error(cErr.message);
  const { data: items, error: iErr } = await supabase
    .from("menu_items")
    .select("id,category_id,name,price,sort_order")
    .eq("is_available", true)
    .order("sort_order", { ascending: true });
  if (iErr) throw new Error(iErr.message);
  return (cats ?? []).map((c) => ({
    category: c.name,
    items: (items ?? [])
      .filter((i) => i.category_id === c.id)
      .map((i) => ({ name: i.name, price: i.price ?? "" })),
  })).filter((c) => c.items.length > 0);
});
