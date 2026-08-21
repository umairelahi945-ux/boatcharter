REVOKE EXECUTE ON FUNCTION public.is_authorized_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_authorized_admin() TO authenticated, service_role;