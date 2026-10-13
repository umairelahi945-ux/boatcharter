
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Boats
CREATE TABLE public.boats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  capacity integer NOT NULL DEFAULT 1,
  length_ft numeric(6,1) NOT NULL DEFAULT 0,
  hourly_rate_cents bigint NOT NULL DEFAULT 0,
  daily_rate_cents bigint NOT NULL DEFAULT 0,
  location text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  amenities text[] NOT NULL DEFAULT '{}',
  image_urls text[] NOT NULL DEFAULT '{}',
  is_available boolean NOT NULL DEFAULT true,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.boats TO anon, authenticated;
GRANT ALL ON public.boats TO service_role;
ALTER TABLE public.boats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can view boats" ON public.boats FOR SELECT TO anon, authenticated USING (archived_at IS NULL);
CREATE TRIGGER boats_updated_at BEFORE UPDATE ON public.boats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bookings
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  boat_id uuid REFERENCES public.boats(id) ON DELETE SET NULL,
  boat_title text NOT NULL DEFAULT '',
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  guest_count integer NOT NULL DEFAULT 1,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  booking_type text NOT NULL CHECK (booking_type IN ('hourly','daily')),
  duration numeric(8,2) NOT NULL,
  subtotal_cents bigint NOT NULL DEFAULT 0,
  fees_cents bigint NOT NULL DEFAULT 0,
  total_price_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded','cancelled')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX bookings_boat_dates_idx ON public.bookings (boat_id, start_date, end_date);

-- Payments
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  payment_method_type text NOT NULL DEFAULT 'card',
  provider text NOT NULL DEFAULT 'demo',
  last_four_digits text,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded','cancelled')),
  transaction_id text NOT NULL UNIQUE,
  amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read payments" ON public.payments FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Financial records
CREATE TABLE public.financial_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  transaction_id text NOT NULL,
  customer_name text NOT NULL DEFAULT '',
  boat_id uuid REFERENCES public.boats(id) ON DELETE SET NULL,
  boat_title text NOT NULL DEFAULT '',
  amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  transaction_type text NOT NULL CHECK (transaction_type IN ('booking_payment','refund','adjustment','other')),
  payment_method text NOT NULL DEFAULT 'card',
  payment_status text NOT NULL DEFAULT 'pending',
  transaction_date timestamptz NOT NULL DEFAULT now(),
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.financial_records TO authenticated;
GRANT ALL ON public.financial_records TO service_role;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read financial records" ON public.financial_records FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER financial_records_updated_at BEFORE UPDATE ON public.financial_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Financial history (append only audit trail)
CREATE TABLE public.financial_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  event_type text NOT NULL,
  booking_id uuid,
  booking_reference text NOT NULL DEFAULT '',
  transaction_id text NOT NULL DEFAULT '',
  boat_id uuid,
  boat_title text NOT NULL DEFAULT '',
  customer_name text NOT NULL DEFAULT '',
  amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.financial_history TO authenticated;
GRANT ALL ON public.financial_history TO service_role;
ALTER TABLE public.financial_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read financial history" ON public.financial_history FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Webhook idempotency
CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'demo',
  event_id text NOT NULL,
  event_type text NOT NULL DEFAULT '',
  payload jsonb NOT NULL DEFAULT '{}',
  processed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);
GRANT ALL ON public.webhook_events TO service_role;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Seed boats
INSERT INTO public.boats (id, title, category, capacity, length_ft, hourly_rate_cents, daily_rate_cents, location, description, amenities, image_urls, is_available) VALUES
('11111111-1111-4111-8111-111111111111','Sea Ray 320 Sundancer','Yacht',10,32.0,45000,285000,'Miami Beach, FL','A refined day cruiser with a spacious cockpit, air-conditioned cabin and plush sun pads. Perfect for sunset cruises along the Miami coastline.','{"Captain Provided","Bluetooth Audio","Fuel Included","Cooler & Ice","Freshwater Shower","Swim Platform"}','{"https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1600&q=80","https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=1600&q=80","https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80"}',true),
('22222222-2222-4222-8222-222222222222','Lagoon 42 Catamaran','Catamaran',12,42.0,62000,390000,'Key West, FL','A stable, wide-beam sailing catamaran with four cabins, shaded trampolines and a full galley. Ideal for full-day island hopping.','{"Captain Provided","Snorkel Gear","Bluetooth Audio","Paddleboards","Shaded Lounge","Onboard Restroom"}','{"https://images.unsplash.com/photo-1514949853744-3535c8b9dcd0?auto=format&fit=crop&w=1600&q=80","https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1600&q=80","https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1600&q=80"}',true),
('33333333-3333-4333-8333-333333333333','Yamaha 242X Speedboat','Speedboat',8,24.0,28000,175000,'San Diego, CA','A twin-jet performance bowrider built for watersports. Tow bar, ballast and bluetooth audio included for a high-energy day on the bay.','{"Bluetooth Audio","Fuel Included","Wakeboard Tow","Bimini Top","Cooler & Ice"}','{"https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=1600&q=80","https://images.unsplash.com/photo-1527431293370-0cd188ca5d15?auto=format&fit=crop&w=1600&q=80","https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1600&q=80"}',true),
('44444444-4444-4444-8444-444444444444','Sunseeker Manhattan 52','Yacht',14,52.0,98000,650000,'Newport Beach, CA','Flagship luxury motor yacht with a hydraulic bathing platform, formal dining saloon and professional crew. The signature Boat Charter experience.','{"Captain Provided","Crew & Steward","Fuel Included","Bluetooth Audio","Snorkel Gear","Air Conditioning","Onboard Restroom"}','{"https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1600&q=80","https://images.unsplash.com/photo-1520255870062-bd79d3865de7?auto=format&fit=crop&w=1600&q=80","https://images.unsplash.com/photo-1542902093-d55926049754?auto=format&fit=crop&w=1600&q=80"}',false);

-- Seed bookings
INSERT INTO public.bookings (id, reference, boat_id, boat_title, customer_name, customer_email, customer_phone, guest_count, start_date, end_date, booking_type, duration, subtotal_cents, fees_cents, total_price_cents, payment_status, status, created_at) VALUES
('aaaaaaa1-0000-4000-8000-000000000001','BC-2K4A7X','11111111-1111-4111-8111-111111111111','Sea Ray 320 Sundancer','Marcus Reed','marcus.reed@example.com','+1 305 555 0142',8, now() + interval '5 days', now() + interval '5 days 4 hours','hourly',4,180000,18000,198000,'paid','confirmed', now() - interval '6 days'),
('aaaaaaa1-0000-4000-8000-000000000002','BC-9F3QLM','22222222-2222-4222-8222-222222222222','Lagoon 42 Catamaran','Elena Vasquez','elena.vasquez@example.com','+1 305 555 0188',10, now() + interval '12 days', now() + interval '14 days','daily',2,780000,78000,858000,'pending','pending', now() - interval '2 days'),
('aaaaaaa1-0000-4000-8000-000000000003','BC-5TZ81P','33333333-3333-4333-8333-333333333333','Yamaha 242X Speedboat','Priya Nair','priya.nair@example.com','+1 619 555 0110',6, now() + interval '3 days', now() + interval '3 days 3 hours','hourly',3,84000,8400,92400,'pending','pending', now() - interval '1 day'),
('aaaaaaa1-0000-4000-8000-000000000004','BC-7RQ2WD','44444444-4444-4444-8444-444444444444','Sunseeker Manhattan 52','Jonathan Blake','jonathan.blake@example.com','+1 949 555 0173',12, now() - interval '10 days', now() - interval '9 days','daily',1,650000,65000,715000,'refunded','cancelled', now() - interval '20 days');

INSERT INTO public.payments (booking_id, payment_method_type, provider, last_four_digits, payment_status, transaction_id, amount_cents) VALUES
('aaaaaaa1-0000-4000-8000-000000000001','card','demo','4242','paid','txn_demo_8fa10c21', 198000),
('aaaaaaa1-0000-4000-8000-000000000002','card','demo','1881','pending','txn_demo_3bd77e40', 858000),
('aaaaaaa1-0000-4000-8000-000000000003','card','demo','0005','pending','txn_demo_c1902ab7', 92400),
('aaaaaaa1-0000-4000-8000-000000000004','card','demo','4444','refunded','txn_demo_5e6b0f93', 715000);

INSERT INTO public.financial_records (booking_id, transaction_id, customer_name, boat_id, boat_title, amount_cents, transaction_type, payment_method, payment_status, transaction_date, notes) VALUES
('aaaaaaa1-0000-4000-8000-000000000001','txn_demo_8fa10c21','Marcus Reed','11111111-1111-4111-8111-111111111111','Sea Ray 320 Sundancer',198000,'booking_payment','card','paid', now() - interval '6 days','Charter payment captured'),
('aaaaaaa1-0000-4000-8000-000000000002','txn_demo_3bd77e40','Elena Vasquez','22222222-2222-4222-8222-222222222222','Lagoon 42 Catamaran',858000,'booking_payment','card','pending', now() - interval '2 days','Awaiting payment authorisation'),
('aaaaaaa1-0000-4000-8000-000000000003','txn_demo_c1902ab7','Priya Nair','33333333-3333-4333-8333-333333333333','Yamaha 242X Speedboat',92400,'booking_payment','card','pending', now() - interval '1 day','Awaiting payment authorisation'),
('aaaaaaa1-0000-4000-8000-000000000004','txn_demo_5e6b0f93','Jonathan Blake','44444444-4444-4444-8444-444444444444','Sunseeker Manhattan 52',715000,'booking_payment','card','paid', now() - interval '20 days','Charter payment captured'),
('aaaaaaa1-0000-4000-8000-000000000004','txn_demo_5e6b0f93-refund','Jonathan Blake','44444444-4444-4444-8444-444444444444','Sunseeker Manhattan 52',715000,'refund','card','refunded', now() - interval '11 days','Full refund - weather cancellation');

INSERT INTO public.financial_history (event, event_type, booking_id, booking_reference, transaction_id, boat_id, boat_title, customer_name, amount_cents, status, notes, occurred_at) VALUES
('Booking created','booking_created','aaaaaaa1-0000-4000-8000-000000000001','BC-2K4A7X','txn_demo_8fa10c21','11111111-1111-4111-8111-111111111111','Sea Ray 320 Sundancer','Marcus Reed',198000,'pending','Booking request received', now() - interval '6 days'),
('Payment succeeded','payment_succeeded','aaaaaaa1-0000-4000-8000-000000000001','BC-2K4A7X','txn_demo_8fa10c21','11111111-1111-4111-8111-111111111111','Sea Ray 320 Sundancer','Marcus Reed',198000,'paid','Card payment captured', now() - interval '6 days'),
('Booking confirmed','booking_confirmed','aaaaaaa1-0000-4000-8000-000000000001','BC-2K4A7X','txn_demo_8fa10c21','11111111-1111-4111-8111-111111111111','Sea Ray 320 Sundancer','Marcus Reed',198000,'paid','Approved by operations', now() - interval '5 days'),
('Booking created','booking_created','aaaaaaa1-0000-4000-8000-000000000002','BC-9F3QLM','txn_demo_3bd77e40','22222222-2222-4222-8222-222222222222','Lagoon 42 Catamaran','Elena Vasquez',858000,'pending','Booking request received', now() - interval '2 days'),
('Booking created','booking_created','aaaaaaa1-0000-4000-8000-000000000003','BC-5TZ81P','txn_demo_c1902ab7','33333333-3333-4333-8333-333333333333','Yamaha 242X Speedboat','Priya Nair',92400,'pending','Booking request received', now() - interval '1 day'),
('Payment succeeded','payment_succeeded','aaaaaaa1-0000-4000-8000-000000000004','BC-7RQ2WD','txn_demo_5e6b0f93','44444444-4444-4444-8444-444444444444','Sunseeker Manhattan 52','Jonathan Blake',715000,'paid','Card payment captured', now() - interval '20 days'),
('Booking cancelled','booking_cancelled','aaaaaaa1-0000-4000-8000-000000000004','BC-7RQ2WD','txn_demo_5e6b0f93','44444444-4444-4444-8444-444444444444','Sunseeker Manhattan 52','Jonathan Blake',715000,'cancelled','Cancelled due to storm warning', now() - interval '11 days'),
('Refund issued','refund_issued','aaaaaaa1-0000-4000-8000-000000000004','BC-7RQ2WD','txn_demo_5e6b0f93-refund','44444444-4444-4444-8444-444444444444','Sunseeker Manhattan 52','Jonathan Blake',715000,'refunded','Full refund processed', now() - interval '11 days');
