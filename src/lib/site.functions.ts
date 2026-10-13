import { createServerFn } from "@tanstack/react-start";

/** Public, read-only site content (policy, map, destinations). */
export const getPublicSiteInfo = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./supabase-public.server");
  const supabase = getPublicClient();
  const [settings, destinations] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("destinations")
      .select("id, name, season_start, season_end")
      .order("sort_order", { ascending: true }),
  ]);
  return {
    cancellationPolicy: settings.data?.cancellation_policy ?? "",
    mapLocation: settings.data?.map_location ?? "",
    mapEmbedUrl: settings.data?.map_embed_url ?? "",
    destinations: destinations.data ?? [],
  };
});
