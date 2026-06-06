/** Comma-separated list of origins allowed to send RELMES_EMBED_USER (Relmes shell). */
export function parseParentOriginAllowlist(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
