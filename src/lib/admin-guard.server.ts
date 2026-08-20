type RpcClient = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
};

/** Verifies the caller holds the admin role. Throws for anyone else. */
export async function assertAdmin(supabase: unknown, userId: string): Promise<void> {
  const client = supabase as RpcClient;
  const { data, error } = await client.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) {
    console.error("[admin] role check failed", error);
    throw new Error("We could not verify your permissions.");
  }
  if (!data) throw new Error("Forbidden: administrator access required.");
}
