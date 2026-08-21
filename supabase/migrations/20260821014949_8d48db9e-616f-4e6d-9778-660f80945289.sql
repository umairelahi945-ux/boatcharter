ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS deposit_cents bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_paid_cents bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due_cents bigint NOT NULL DEFAULT 0;

UPDATE public.bookings b
SET deposit_cents = round(b.total_price_cents * 0.20),
    amount_paid_cents = COALESCE((
      SELECT SUM(p.amount_cents) FROM public.payments p
      WHERE p.booking_id = b.id AND p.payment_status = 'paid'
    ), 0),
    balance_due_cents = GREATEST(b.total_price_cents - COALESCE((
      SELECT SUM(p.amount_cents) FROM public.payments p
      WHERE p.booking_id = b.id AND p.payment_status = 'paid'
    ), 0), 0);