import { useEffect, useState } from "react";
import { useEmbedUserContext } from "@/embed/EmbedUserProvider";
import { fetchMe } from "@/lib/authApi";
import type { PublicUser } from "@/lib/authApi";

/** Wait for Relmes embed sync, then read the plugin session (cookie or Bearer). */
export function usePluginAuth() {
  const {
    hideBoilerplateAuth,
    receivedFromParent,
    pluginSessionSynced,
    pluginSessionSyncing,
    pluginSessionFailed,
    pluginApiUser,
  } = useEmbedUserContext();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (
      hideBoilerplateAuth &&
      !pluginSessionFailed &&
      (!receivedFromParent || pluginSessionSyncing || !pluginSessionSynced)
    ) {
      return;
    }

    let cancelled = false;
    void fetchMe().then((u) => {
      if (cancelled) return;
      setUser(u ?? (pluginSessionSynced ? pluginApiUser : null));
      setChecked(true);
    });

    return () => {
      cancelled = true;
    };
  }, [
    hideBoilerplateAuth,
    receivedFromParent,
    pluginSessionSynced,
    pluginSessionSyncing,
    pluginSessionFailed,
    pluginApiUser,
  ]);

  const loading =
    !checked ||
    (hideBoilerplateAuth &&
      !pluginSessionFailed &&
      (!receivedFromParent || pluginSessionSyncing || !pluginSessionSynced));

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    hideBoilerplateAuth,
    awaitingEmbedSession: hideBoilerplateAuth && !pluginSessionSynced && !pluginSessionFailed,
    embedFailed: hideBoilerplateAuth && pluginSessionFailed,
  };
}
