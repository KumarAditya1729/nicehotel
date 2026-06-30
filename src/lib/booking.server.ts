import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type RoomRow = {
  id: string; name: string; price: number; weekend_price: number | null; capacity: number;
  images: string[] | null; category: string | null;
};

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + "T00:00:00Z").getTime();
  const b = new Date(checkOut + "T00:00:00Z").getTime();
  const n = Math.round((b - a) / 86400000);
  return n > 0 ? n : 0;
}

export async function getRoomById(roomId: string): Promise<RoomRow> {
  const { data, error } = await (supabaseAdmin as any)
    .from("rooms")
    .select("id,name,price,weekend_price,capacity,images,category")
    .eq("id", roomId)
    .eq("is_active", true)
    .single();
  if (error || !data) throw new Error("Room not found");
  return data as RoomRow;
}

export async function computeQuote(roomId: string, checkIn: string, checkOut: string) {
  const room = await getRoomById(roomId);
  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) throw new Error("Invalid date range");
  const amountInr = Number(room.price) * nights;
  return { room, nights, amountInr };
}
