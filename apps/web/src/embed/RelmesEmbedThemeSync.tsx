import { useEffect } from "react";
import { useTheme, type ThemeMode } from "@/design";
import { RELMES_EMBED_THEME } from "./constants";
import { getRelmesParentOriginAllowlist } from "./trustedOrigins";

/**
 * Applies Relm shell theme from postMessage when the app runs inside /relm.
 * Parent toggles `document.documentElement.classList` and mirrors it here.
 */
export function RelmesEmbedThemeSync() {
  const { setMode } = useTheme();

  useEffect(() => {
    const allowed = getRelmesParentOriginAllowlist();

    function onMessage(e: MessageEvent) {
      if (e.data?.type !== RELMES_EMBED_THEME) return;
      const raw = e.data?.payload?.mode;
      if (raw !== "light" && raw !== "dark") return;
      if (!allowed.includes(e.origin)) {
        if (import.meta.env.DEV) {
          console.warn("[embed] ignored RELMES_EMBED_THEME from:", e.origin);
        }
        return;
      }
      setMode(raw as ThemeMode);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setMode]);

  return null;
}
