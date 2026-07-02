import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type RoomRow = {
  id: string;
  name: string;
  price: number;
  weekend_price: number | null;
  capacity: number;
  images: string[] | null;
  category: string | null;
  total_units?: number | null;
};

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + "T00:00:00Z").getTime();
  const b = new Date(checkOut + "T00:00:00Z").getTime();
  const n = Math.round((b - a) / 86400000);
  return n > 0 ? n : 0;
}

export async function getRoomById(roomId: string): Promise<RoomRow> {
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .eq("room_id", roomId)
    .in("status", ["confirmed", "checked_in"])
    .lt("check_in", checkOut)
    .gt("check_out", checkIn)
    .limit(1);
  if (error) throw new Error("Could not check availability");
  if (data && data.length > 0)
    throw new Error("Selected dates are no longer available for this room");
}

/** Returns an existing booking id for a Razorpay payment/order (idempotency), or null. */
export async function findExistingBooking(
  orderId: string,
  paymentId: string,
): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .or(`razorpay_payment_id.eq.${paymentId},razorpay_order_id.eq.${orderId}`)
    .limit(1);
  return data && data.length > 0 ? data[0].id : null;
}

/* ----------------------------- Multi-room support ----------------------------- */

export type RoomItemInput = {
  roomId: string;
  quantity: number;
  adults: number;
  children?: number;
  extraBed?: boolean;
  notes?: string;
};

export type QuoteLine = {
  room: RoomRow;
  quantity: number;
  adults: number;
  children: number;
  extraBed: boolean;
  notes: string | null;
  unitPrice: number; // price per room for the whole stay (price * nights)
  lineTotal: number; // unitPrice * quantity
};

const EXTRA_BED_PER_NIGHT = 800;

/** Count how many units of a room are already booked over an overlapping date range. */
export async function bookedUnitsForRoom(
  roomId: string,
  checkIn: string,
  checkOut: string,
): Promise<number> {
  // New multi-room lines
  const { data: lines } = await supabaseAdmin
    .from("booking_rooms")
    .select("quantity, bookings!inner(status, check_in, check_out)")
    .eq("room_id", roomId)
    .in("bookings.status", ["confirmed", "checked_in"])
    .lt("bookings.check_in", checkOut)
    .gt("bookings.check_out", checkIn);
  let units = 0;
  const countedBookingIds = new Set<string>();
  for (const l of lines ?? []) units += Number(l.quantity) || 1;

  // Legacy single-room bookings (no child rows) — count as 1 each
  const { data: legacy } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .eq("room_id", roomId)
    .in("status", ["confirmed", "checked_in"])
    .lt("check_in", checkOut)
    .gt("check_out", checkIn);
  if (legacy && legacy.length) {
    const ids = legacy.map((b: { id: string }) => b.id);
    const { data: hasChildren } = await supabaseAdmin
      .from("booking_rooms")
      .select("booking_id")
      .in("booking_id", ids);
    const withChildren = new Set(
      (hasChildren ?? []).map((r: { booking_id: string }) => r.booking_id),
    );
    for (const b of legacy) {
      if (!withChildren.has(b.id) && !countedBookingIds.has(b.id)) units += 1;
    }
  }
  return units;
}

export async function getRoomsByIds(ids: string[]): Promise<Record<string, RoomRow>> {
  const unique = [...new Set(ids)];
  const { data, error } = await supabaseAdmin
    .from("rooms")
    .select("id,name,price,weekend_price,capacity,images,category,total_units")
    .in("id", unique)
    .eq("is_active", true);
  if (error) {
    console.error("getRoomsByIds error:", error);
    throw new Error("Could not load rooms: " + error.message);
  }
  const map: Record<string, RoomRow> = {};
  for (const r of data ?? []) map[r.id] = r as RoomRow;
  for (const id of unique) if (!map[id]) throw new Error("Room not found");
  return map;
}

/** Build a priced quote for multiple room lines. */
export async function computeMultiQuote(items: RoomItemInput[], checkIn: string, checkOut: string) {
  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) throw new Error("Invalid date range");
  if (!items.length) throw new Error("No rooms selected");
  const rooms = await getRoomsByIds(items.map((i) => i.roomId));
  const lines: QuoteLine[] = items.map((i) => {
    const room = rooms[i.roomId];
    const qty = Math.max(1, Number(i.quantity) || 1);
    const extraBed = !!i.extraBed;
    const unitPrice = Number(room.price) * nights + (extraBed ? EXTRA_BED_PER_NIGHT * nights : 0);
    return {
      room,
      quantity: qty,
      adults: Math.max(1, Number(i.adults) || 1),
      children: Math.max(0, Number(i.children) || 0),
      extraBed,
      notes: i.notes?.trim() || null,
      unitPrice,
      lineTotal: unitPrice * qty,
    };
  });
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const taxRate = 0.05; // 5% GST
  const taxes = Math.round(subtotal * taxRate);
  const grandTotal = subtotal + taxes;
  return { nights, lines, subtotal, taxRate, taxes, grandTotal };
}

/** Throws if any room line cannot be fulfilled for the date range. */
export async function assertMultiAvailable(
  items: RoomItemInput[],
  checkIn: string,
  checkOut: string,
) {
  const rooms = await getRoomsByIds(items.map((i) => i.roomId));
  // aggregate requested quantity per room
  const requested: Record<string, number> = {};
  for (const i of items)
    requested[i.roomId] = (requested[i.roomId] ?? 0) + Math.max(1, Number(i.quantity) || 1);
  for (const roomId of Object.keys(requested)) {
    const room = rooms[roomId];
    const totalUnits = Number(room.total_units) || 1;
    const booked = await bookedUnitsForRoom(roomId, checkIn, checkOut);
    const available = totalUnits - booked;
    if (requested[roomId] > available) {
      throw new Error(
        `${room.name}: only ${Math.max(0, available)} room(s) available for these dates`,
      );
    }
  }
}
