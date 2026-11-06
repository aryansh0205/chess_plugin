import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { RELMES_EMBED_READY, RELMES_EMBED_USER } from "./constants";
import type { RelmesEmbedUser } from "./types";
import {
  hasRelmesEmbedSessionVerified,
  markRelmesEmbedSessionVerified,
  readRelmesEmbedUserCookie,
  writeRelmesEmbedUserCookie,
} from "./embedUserCookies";
import {
  getRelmesParentOriginAllowlist,
  isTrustedRelmesReferrer,
} from "./trustedOrigins";
import { captureEmbedQueryFromUrl } from "./relmesEmbed";

const HANDSHAKE_TIMEOUT_MS = 25_000;
// // Detects “I am in an iframe on relmes.com”
function parseDbNameFromQuery(encoded: string | null): string {
  if (!encoded) return "";
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    return "";
  }
}

function readBootstrap(): Partial<RelmesEmbedUser> | null {
  const q = new URLSearchParams(window.location.search);
  const userId = q.get("userId") ?? "";
  const serverId = q.get("serverId") ?? "";
  const dbName = parseDbNameFromQuery(q.get("dbName"));
  const iframeFlag = q.get("iframe") === "1";
  const framed = window.self !== window.top;
  if (!iframeFlag && !framed) return null;
  if (!iframeFlag && framed && !userId && !serverId) return null;
  return {
    userId,
    serverId,
    dbName,
    id: userId,
    email: "",
    fullname: "",
    username: "",
    profilePicUrl: "",
    isVerified: false,
    role: "",
  };
}

function mergeUser(
  base: Partial<RelmesEmbedUser> | null,
  patch: RelmesEmbedUser,
): RelmesEmbedUser {
  return {
    id: patch.id || base?.id || "",
    email: patch.email ?? base?.email ?? "",
    fullname: patch.fullname ?? base?.fullname ?? "",
    username: patch.username ?? base?.username ?? "",
    profilePicUrl: patch.profilePicUrl ?? base?.profilePicUrl ?? "",
    isVerified: patch.isVerified ?? base?.isVerified ?? false,
    role: patch.role ?? base?.role ?? "",
    serverId: patch.serverId ?? base?.serverId ?? "",
    dbName: patch.dbName ?? base?.dbName ?? "",
    userId: patch.userId ?? patch.id ?? base?.userId ?? base?.id ?? "",
  };
}

function normalizePayload(
  raw: Record<string, unknown>,
): RelmesEmbedUser | null {
  const id = String(raw.id ?? raw.userId ?? "");
  if (!id) return null;
  return {
    id,
    email: String(raw.email ?? ""),
    fullname: String(raw.fullname ?? ""),
    username: String(raw.username ?? ""),
    profilePicUrl: String(raw.profilePicUrl ?? ""),
    isVerified: Boolean(raw.isVerified),
    role: String(raw.role ?? ""),
    serverId: String(raw.serverId ?? ""),
    dbName: String(raw.dbName ?? ""),
    userId: String(raw.userId ?? raw.id ?? ""),
  };
}

export type EmbedCtx = {
  /** In an iframe or explicit `?iframe=1` (plugin shell). */
  isEmbed: boolean;
  /** Hide boilerplate login/signup/logout when iframe is under Relmes (referrer) or embed was verified via postMessage. */
  hideBoilerplateAuth: boolean;
  user: RelmesEmbedUser | null;
  /** Handshake: parent sent `relmes:embed:user` from an allowed Relmes origin. */
  receivedFromParent: boolean;
  relmesHandshakeFailed: boolean;
  /** Plugin API session created from the Relmes embed user. */
  pluginSessionSynced: boolean;
  pluginSessionSyncing: boolean;
  pluginSessionFailed: boolean;
  pluginApiUser: { id: string; email: string; name: string } | null;
  setPluginSessionSynced: (synced: boolean) => void;
  setPluginSessionSyncing: (syncing: boolean) => void;
  setPluginSessionFailed: (failed: boolean) => void;
  setPluginApiUser: (user: { id: string; email: string; name: string } | null) => void;
};

const EmbedUserContext = createContext<EmbedCtx | null>(null);

function RelmesHandshakeLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-page text-fg">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-accent"
        aria-hidden
      />
      <p className="max-w-sm px-6 text-center text-sm text-fg-muted">
        Authenticating user…
      </p>
    </div>
  );
}

function RelmesHandshakeError({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-[hsl(var(--color-page))] px-6 text-center text-[hsl(var(--color-fg))]">
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-md text-xs text-[hsl(var(--color-fg-muted))]">{detail}</p>
    </div>
  );
}

export function EmbedUserProvider({ children }: { children: ReactNode }) {
  const allowedOriginsRef = useRef(getRelmesParentOriginAllowlist());

  const [isIframeContext] = useState(() => {
    if (typeof window === "undefined") return false;
    const q = new URLSearchParams(window.location.search);
    return q.get("iframe") === "1" || window.self !== window.top;
  });

  const [embedSessionVerified, setEmbedSessionVerified] = useState(
    () => typeof window !== "undefined" && hasRelmesEmbedSessionVerified(),
  );

  const [user, setUser] = useState<RelmesEmbedUser | null>(() => {
    if (typeof window === "undefined") return null;
    const q = new URLSearchParams(window.location.search);
    const framed = q.get("iframe") === "1" || window.self !== window.top;
    if (framed) {
      const fromCookie = readRelmesEmbedUserCookie();
      if (fromCookie) return fromCookie;
    }

    const b = readBootstrap();
    if (!b?.userId && !b?.serverId && !(window.self !== window.top))
      return null;
    if (!b) return null;
    const merged = mergeUser(b, {
      ...b,
      id: b.id ?? b.userId ?? "",
      email: b.email ?? "",
      fullname: b.fullname ?? "",
      username: b.username ?? "",
      profilePicUrl: b.profilePicUrl ?? "",
      isVerified: b.isVerified ?? false,
      role: b.role ?? "",
      serverId: b.serverId ?? "",
      dbName: b.dbName ?? "",
      userId: b.userId ?? b.id ?? "",
    } as RelmesEmbedUser);
    return merged.id || merged.serverId ? merged : null;
  });

  const [receivedFromParent, setReceivedFromParent] = useState(() => {
    if (typeof window === "undefined") return false;
    const q = new URLSearchParams(window.location.search);
    const framed = q.get("iframe") === "1" || window.self !== window.top;
    if (!framed) return false;
    const c = readRelmesEmbedUserCookie();
    if (c?.id && hasRelmesEmbedSessionVerified()) return true;
    // Relmes iframe URL always includes userId + serverId — start embed sync without waiting for postMessage.
    const userId = q.get("userId")?.trim() ?? "";
    const serverId = q.get("serverId")?.trim() ?? "";
    return Boolean(userId && serverId);
  });
  const [relmesHandshakeFailed, setRelmesHandshakeFailed] = useState(false);
  const [pluginSessionSynced, setPluginSessionSynced] =
    useState(!isIframeContext);
  const [pluginSessionSyncing, setPluginSessionSyncing] = useState(false);
  const [pluginSessionFailed, setPluginSessionFailed] = useState(false);
  const [pluginApiUser, setPluginApiUser] = useState<{
    id: string;
    email: string;
    name: string;
  } | null>(null);
  const receivedRef = useRef(false);
  receivedRef.current = receivedFromParent;

  const announceReady = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.self === window.top) return;
    window.parent.postMessage({ type: RELMES_EMBED_READY }, "*");
  }, []);

  useEffect(() => {
    captureEmbedQueryFromUrl();
    announceReady();
  }, [announceReady]);

  useEffect(() => {
    if (!isIframeContext) return;
    const t = window.setTimeout(() => {
      if (!receivedRef.current) setRelmesHandshakeFailed(true);
    }, HANDSHAKE_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [isIframeContext]);

  useEffect(() => {
    const allowed = allowedOriginsRef.current;

    function originAllowed(origin: string): boolean {
      return allowed.includes(origin);
    }

    function onMessage(e: MessageEvent) {
      if (e.data?.type !== RELMES_EMBED_USER) return;
      const payload = e.data?.payload;
      if (!payload || typeof payload !== "object") return;
      const normalized = normalizePayload(payload as Record<string, unknown>);
      if (!normalized) return;

      if (!originAllowed(e.origin)) {
        if (import.meta.env.DEV) {
          console.warn(
            "[embed] ignored RELMES_EMBED_USER from unexpected origin:",
            e.origin,
            "allowed:",
            allowed,
          );
        }
        return;
      }

      setUser((prev) => {
        const next = mergeUser(prev, normalized);
        if (
          next.id &&
          (next.id !== prev?.id || next.serverId !== prev?.serverId)
        ) {
          setPluginSessionSynced(false);
          setPluginSessionFailed(false);
          setPluginApiUser(null);
        }
        return next;
      });
      writeRelmesEmbedUserCookie(normalized);
      markRelmesEmbedSessionVerified();
      setEmbedSessionVerified(true);
      setReceivedFromParent(true);
      setRelmesHandshakeFailed(false);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const hideBoilerplateAuth =
    isIframeContext && (isTrustedRelmesReferrer() || embedSessionVerified);

  const value = useMemo(
    (): EmbedCtx => ({
      isEmbed: isIframeContext,
      hideBoilerplateAuth,
      user,
      receivedFromParent,
      relmesHandshakeFailed,
      pluginSessionSynced,
      pluginSessionSyncing,
      pluginSessionFailed,
      pluginApiUser,
      setPluginSessionSynced,
      setPluginSessionSyncing,
      setPluginSessionFailed,
      setPluginApiUser,
    }),
    [
      isIframeContext,
      hideBoilerplateAuth,
      user,
      receivedFromParent,
      relmesHandshakeFailed,
      pluginSessionSynced,
      pluginSessionSyncing,
      pluginSessionFailed,
      pluginApiUser,
    ],
  );

  const showApp =
    !isIframeContext || receivedFromParent || relmesHandshakeFailed;

  const showLoading =
    isIframeContext &&
    !relmesHandshakeFailed &&
    !pluginSessionFailed &&
    (!receivedFromParent || !pluginSessionSynced);

  if (
    import.meta.env.DEV &&
    isIframeContext &&
    typeof document !== "undefined"
  ) {
    if (
      !isTrustedRelmesReferrer() &&
      !new URLSearchParams(window.location.search).has("iframe")
    ) {
      // framed but odd referrer — still wait for postMessage; only log once
      const w = window as Window & { __relmesReferrerWarned?: boolean };
      if (!w.__relmesReferrerWarned) {
        w.__relmesReferrerWarned = true;
        console.info(
          "[embed] Iframe referrer is not a known Relmes host; waiting for postMessage from an allowed origin.",
        );
      }
    }
  }

  return (
    <EmbedUserContext.Provider value={value}>
      {showLoading ? <RelmesHandshakeLoading /> : null}
      {isIframeContext && relmesHandshakeFailed ? (
        <RelmesHandshakeError
          title="Could not load your Relmes session"
          detail="Open this plugin from the Relmes app at relmes.in, relmes.com, or localhost:3000, and stay signed in there."
        />
      ) : null}
      {/*
        Children must mount while the "Authenticating user…" overlay is up: they include
        <RelmesEmbedAuthSync />, which is what flips `pluginSessionSynced` and clears the overlay.
        Gating on `!showLoading` here deadlocks (sync never runs, overlay never goes away).
        The overlay is fixed/z-100 and usePluginAuth() already waits for the session.
      */}
      {showApp ? children : null}
    </EmbedUserContext.Provider>
  );
}

export function useEmbedUserContext(): EmbedCtx {
  const ctx = useContext(EmbedUserContext);
  if (!ctx)
    throw new Error(
      "useEmbedUserContext must be used within EmbedUserProvider",
    );
  return ctx;
}

export function useEmbedUser(): EmbedCtx | null {
  return useContext(EmbedUserContext);
}
