CREATE OR REPLACE FUNCTION public.is_authorized_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(trim(coalesce((auth.jwt() ->> 'email'), ''))) IN (
    'hibasaratechservices@gmail.com',
    'umairelahi945@gmail.com',
    'umairlelahi945@gmail.com'
  );
$$;