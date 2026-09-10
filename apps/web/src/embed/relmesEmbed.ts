const PLUGIN_ID_KEY = "relmes_embed_plugin_id";
const EMBED_QUERY_KEY = "relmes_embed_query";
const EMBED_PARAM_KEYS = ["serverId", "userId", "pluginId", "dbName"] as const;

export function captureEmbedQueryFromUrl(search = window.location.search): void {
  const q = new URLSearchParams(search);
  const pluginId = q.get("pluginId")?.trim();
  if (pluginId) {
    try {
      sessionStorage.setItem(PLUGIN_ID_KEY, pluginId);
    } catch {
      /* ignore */
    }
  }

  const parts: string[] = [];
  for (const key of EMBED_PARAM_KEYS) {
    const value = q.get(key)?.trim();
    if (value) parts.push(`${key}=${encodeURIComponent(value)}`);
  }
  if (parts.length === 0) return;

  try {
    sessionStorage.setItem(EMBED_QUERY_KEY, parts.join("&"));
  } catch {
    /* ignore */
  }
}

export function resolveRelmesPluginId(): string | null {
  const fromQuery = new URLSearchParams(window.location.search).get("pluginId")?.trim();
  if (fromQuery) return fromQuery;
  try {
    return sessionStorage.getItem(PLUGIN_ID_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

export function relmesPluginQuery(): string {
  const pluginId = resolveRelmesPluginId();
  return pluginId ? `pluginId=${encodeURIComponent(pluginId)}` : "";
}

export function withPluginQuery(path: string): string {
  const q = relmesPluginQuery();
  if (!q) return path;
  return path.includes("?") ? `${path}&${q}` : `${path}?${q}`;
}

export function withEmbedQuery(path: string): string {
  try {
    const stored = sessionStorage.getItem(EMBED_QUERY_KEY)?.trim();
    if (!stored) return path;
    const suffix = `?${stored}`;
    return path.includes("?") ? `${path}&${stored}` : `${path}${suffix}`;
  } catch {
    return path;
  }
}
