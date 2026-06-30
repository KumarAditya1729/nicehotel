
-- Booking: link to user account + payment tracking
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS nights integer,
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text;

-- Users can read their own bookings
DROP POLICY IF EXISTS "Users read own bookings" ON public.bookings;
CREATE POLICY "Users read own bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_staff(auth.uid()));

-- Public read of active rooms (website renders from DB)
GRANT SELECT ON public.rooms TO anon;
DROP POLICY IF EXISTS "Public read active rooms" ON public.rooms;
CREATE POLICY "Public read active rooms" ON public.rooms
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Public read of active offers
GRANT SELECT ON public.offers TO anon;
DROP POLICY IF EXISTS "Public read active offers" ON public.offers;
CREATE POLICY "Public read active offers" ON public.offers
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Public read of active menu categories & items
GRANT SELECT ON public.menu_categories TO anon;
DROP POLICY IF EXISTS "Public read active categories" ON public.menu_categories;
CREATE POLICY "Public read active categories" ON public.menu_categories
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

GRANT SELECT ON public.menu_items TO anon;
DROP POLICY IF EXISTS "Public read available items" ON public.menu_items;
CREATE POLICY "Public read available items" ON public.menu_items
  FOR SELECT TO anon, authenticated
  USING (is_available = true);
