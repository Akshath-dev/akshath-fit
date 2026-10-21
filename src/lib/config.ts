export function readPublicConfig(
  env: Record<string, string | undefined>,
): { url: string; publishableKey: string } | null {
  const url = env.VITE_SUPABASE_URL?.trim(),
    key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" &&
      !(
        parsed.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(parsed.hostname)
      )
    )
      return null;
  } catch {
    return null;
  }
  if (key.startsWith("sb_publishable_")) return { url, publishableKey: key };
  try {
    const payload = JSON.parse(
      atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (payload.role === "anon") return { url, publishableKey: key };
  } catch {
    /* Invalid and private keys fail closed. */
  }
  return null;
}
