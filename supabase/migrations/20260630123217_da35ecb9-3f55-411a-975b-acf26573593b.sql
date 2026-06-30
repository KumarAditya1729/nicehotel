ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS total_units integer NOT NULL DEFAULT 1;

UPDATE public.rooms SET total_units = 5 WHERE total_units = 1;