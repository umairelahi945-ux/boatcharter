DELETE FROM public.financial_history;
DELETE FROM public.financial_records;
DELETE FROM public.payments;
DELETE FROM public.bookings;
DELETE FROM public.webhook_events;
DELETE FROM public.user_roles;

CREATE OR REPLACE FUNCTION public.is_authorized_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) IN (
    'hibasaratechservices@gmail.com',
    'umairlelahi945@gmail.com'
  );
$$;

REVOKE ALL ON FUNCTION public.is_authorized_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_authorized_admin() TO authenticated, service_role;

DROP POLICY IF EXISTS "admins read bookings" ON public.bookings;
CREATE POLICY "authorized admins read bookings" ON public.bookings
  FOR SELECT TO authenticated USING (public.is_authorized_admin());

DROP POLICY IF EXISTS "admins read payments" ON public.payments;
CREATE POLICY "authorized admins read payments" ON public.payments
  FOR SELECT TO authenticated USING (public.is_authorized_admin());

DROP POLICY IF EXISTS "admins read financial records" ON public.financial_records;
CREATE POLICY "authorized admins read financial records" ON public.financial_records
  FOR SELECT TO authenticated USING (public.is_authorized_admin());

DROP POLICY IF EXISTS "admins read financial history" ON public.financial_history;
CREATE POLICY "authorized admins read financial history" ON public.financial_history
  FOR SELECT TO authenticated USING (public.is_authorized_admin());