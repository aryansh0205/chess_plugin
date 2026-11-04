import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RELMES_EMBED_NAV_BACK, RELMES_EMBED_NAV_STATE } from "./constants";

function routerHistoryIndex(): number {
  const idx = window.history.state?.idx;
  return typeof idx === "number" && Number.isFinite(idx) ? idx : 0;
}

function pluginCanGoBack(): boolean {
  return routerHistoryIndex() > 0;
}

/** Reports in-plugin history to the Relm mobile back button and handles its back request. */
export function RelmesEmbedNavSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const backLock = useRef(false);

  useEffect(() => {
    backLock.current = false;
    if (window.parent === window) return;
    window.parent.postMessage(
      {
        type: RELMES_EMBED_NAV_STATE,
        payload: { canGoBack: pluginCanGoBack() },
      },
      "*",
    );
  }, [location.key, location.pathname]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      if (event.data?.type !== RELMES_EMBED_NAV_BACK) return;
      if (backLock.current) return;
      if (routerHistoryIndex() <= 0) return;
      backLock.current = true;
      navigate(-1);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate]);

  return null;
}
