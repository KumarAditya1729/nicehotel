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
    .select("id,name,room_number,category,description,price,weekend_price,capacity,floor,amenities,images,status,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
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
