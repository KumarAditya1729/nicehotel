-- Drop the vulnerable policy that allows anyone to create pending bookings
DROP POLICY IF EXISTS "Public submit bookings" ON public.bookings;
