DROP POLICY IF EXISTS "public can read site settings" ON public.site_settings;
CREATE POLICY "public can read site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (id = 1);