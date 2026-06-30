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

/**
 * Throws if the room has an overlapping active booking for the given dates.
 * Overlap rule: existing.check_in < newCheckOut AND existing.check_out > newCheckIn.
 */
export async function assertAvailable(roomId: string, checkIn: string, checkOut: string) {
  const { data, error } = await (supabaseAdmin as any)
    .from("bookings")
    .select("id")
    .eq("room_id", roomId)
    .neq("status", "cancelled")
    .lt("check_in", checkOut)
    .gt("check_out", checkIn)
    .limit(1);
  if (error) throw new Error("Could not check availability");
  if (data && data.length > 0) throw new Error("Selected dates are no longer available for this room");
}

/** Returns an existing booking id for a Razorpay payment/order (idempotency), or null. */
export async function findExistingBooking(orderId: string, paymentId: string): Promise<string | null> {
  const { data } = await (supabaseAdmin as any)
    .from("bookings")
    .select("id")
    .or(`razorpay_payment_id.eq.${paymentId},razorpay_order_id.eq.${orderId}`)
    .limit(1);
  return data && data.length > 0 ? data[0].id : null;
}
