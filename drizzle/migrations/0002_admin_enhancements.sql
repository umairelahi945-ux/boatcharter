ALTER TABLE public.boats
  ADD COLUMN extra_passenger_charge_cents bigint NOT NULL DEFAULT 0,
  ADD COLUMN with_snacks_price_cents bigint NOT NULL DEFAULT 0,
  ADD COLUMN without_snacks_price_cents bigint NOT NULL DEFAULT 0,
  ADD COLUMN min_booking_hours integer NOT NULL DEFAULT 2,
  ADD COLUMN captain_name text NOT NULL DEFAULT '',
  ADD COLUMN company_name text NOT NULL DEFAULT '',
  ADD COLUMN contact_email text NOT NULL DEFAULT '',
  ADD COLUMN contact_phone text NOT NULL DEFAULT '';

ALTER TABLE public.bookings ADD COLUMN additional_passengers integer NOT NULL DEFAULT 0;

CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  cancellation_policy text NOT NULL DEFAULT '',
  map_location text NOT NULL DEFAULT '',
  map_embed_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can read site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  season_start text NOT NULL DEFAULT '',
  season_end text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.destinations TO anon, authenticated;
GRANT ALL ON public.destinations TO service_role;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can read active destinations" ON public.destinations FOR SELECT TO anon, authenticated USING (is_active);
CREATE TRIGGER destinations_updated_at BEFORE UPDATE ON public.destinations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.destinations (name, season_start, season_end, sort_order) VALUES
('Phuket, Thailand','November','April',1),
('Mahé, Seychelles','December','May/June',2),
('Bahamas (Exumas)','December','April',3),
('Curaçao','December','April',4),
('Cozumel','December','April',5),
('Grand Cayman','December','April',6),
('Aruba','November','April',7),
('St. Martin','December','April/May',8),
('Anguilla','November','April/May',9),
('St. Barths','December','April/May',10),
('Cabo San Lucas, Mexico','December','April/May',11),
('La Paz, Baja California Sur','December','April/May',12),
('La Paz, Mexico','December','April/May',13),
('Maldives, Indian Ocean','November','April',14),
('Cancun, Mexico','December','July/August',15),
('Punta Cana, Dominican Republic','December','April',16),
('Caribbean (Barbados, Jamaica)','December','April',17),
('Turks and Caicos Islands, Grace Bay','December','April',18)
ON CONFLICT (name) DO NOTHING;