ALTER TABLE public.bookings
  ADD COLUMN admin_status text,
  ADD COLUMN payment_link_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN payment_tracking_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.bookings ADD CONSTRAINT bookings_admin_status_check CHECK (admin_status IS NULL OR admin_status IN ('inquiry_sent_to_captain','refused_by_captain','booking_sent_to_customer','refused_by_customer','confirmed','confirmation_sent_to_customer','completed','cancelled','refunded'));
ALTER TABLE public.bookings ADD CONSTRAINT bookings_payment_tracking_status_check CHECK (payment_tracking_status IN ('pending','paid','unpaid'));