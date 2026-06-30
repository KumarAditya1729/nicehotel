CREATE TABLE public.booking_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id),
  room_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  extra_bed BOOLEAN NOT NULL DEFAULT false,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  room_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_rooms_booking_id ON public.booking_rooms(booking_id);
CREATE INDEX idx_booking_rooms_room_id ON public.booking_rooms(room_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_rooms TO authenticated;
GRANT ALL ON public.booking_rooms TO service_role;

ALTER TABLE public.booking_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own booking rooms" ON public.booking_rooms
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.is_staff(auth.uid()))));

CREATE POLICY "Staff manage booking rooms" ON public.booking_rooms
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));