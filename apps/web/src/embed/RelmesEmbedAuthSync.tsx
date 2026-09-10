import { useEffect, useRef } from "react";
import { fetchMe, loginWithEmbed } from "@/lib/authApi";
import { useEmbedUserContext } from "./EmbedUserProvider";

const EMBED_ATTEMPTS = 3;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * Exchanges the Relmes iframe payload for a plugin Mongo user + session.
 * Does not treat the parent postMessage name as a signed-in plugin account.
 */
export function RelmesEmbedAuthSync() {
  const {
    isEmbed,
    user,
    receivedFromParent,
    setPluginSessionSynced,
    setPluginSessionSyncing,
    setPluginSessionFailed,
    setPluginApiUser,
  } = useEmbedUserContext();
  const syncedForRef = useRef<string | null>(null);
  const embedScopeKey =
    user?.serverId && user?.id
      ? `${user.serverId}:${user.id}:${user.email ?? ""}:${user.fullname ?? ""}:${user.username ?? ""}`
      : null;

  useEffect(() => {
    syncedForRef.current = null;
  }, [embedScopeKey]);

  useEffect(() => {
    if (!isEmbed || !receivedFromParent || !user?.id || !user.serverId) return;
    if (syncedForRef.current === embedScopeKey) return;

    let cancelled = false;
    setPluginSessionFailed(false);
    setPluginSessionSyncing(true);

    const body = {
      id: user.id,
      serverId: user.serverId,
      userId: user.userId || user.id,
      email: user.email || undefined,
      fullname: user.fullname || undefined,
      username: user.username || undefined,
    };

    void (async () => {
      let lastError: unknown;
      for (let attempt = 1; attempt <= EMBED_ATTEMPTS; attempt++) {
        if (cancelled) return;
        try {
          const result = await loginWithEmbed(body);
          if (cancelled) return;
          syncedForRef.current = embedScopeKey;
          setPluginApiUser(result.user);
          setPluginSessionSynced(true);
          setPluginSessionFailed(false);
          return;
        } catch (err) {
          lastError = err;
          try {
            const existing = await fetchMe();
            if (existing) {
              if (cancelled) return;
              syncedForRef.current = embedScopeKey;
              setPluginApiUser(existing);
              setPluginSessionSynced(true);
              setPluginSessionFailed(false);
              return;
            }
          } catch {
            // keep retrying embed
          }
          if (attempt < EMBED_ATTEMPTS) await wait(400 * attempt);
        }
      }

      if (cancelled) return;
      console.error("[embed] Relmes session sync failed:", lastError);
      setPluginSessionSynced(false);
      setPluginApiUser(null);
      setPluginSessionFailed(true);
    })().finally(() => {
      if (!cancelled) setPluginSessionSyncing(false);
    });

    return () => {
      cancelled = true;
    };
  }, [
    isEmbed,
    receivedFromParent,
    embedScopeKey,
    user?.id,
    user?.serverId,
    user?.userId,
    user?.email,
    user?.fullname,
    user?.username,
    setPluginSessionSynced,
    setPluginSessionSyncing,
    setPluginSessionFailed,
    setPluginApiUser,
  ]);

  return null;
}
