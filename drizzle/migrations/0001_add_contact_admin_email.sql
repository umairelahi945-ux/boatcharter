CREATE OR REPLACE FUNCTION public.is_authorized_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT lower(trim(coalesce((auth.jwt() ->> 'email'), ''))) IN (
    'hibasaratechservices@gmail.com',
    'umairelahi945@gmail.com',
    'umairlelahi945@gmail.com',
    'ibrar@horizonboatcharters.com',
    'sam@horizonboatcharters.com',
    'contact@horizonboatcharters.com'
  );
$function$;