import type { RelmesEmbedUser } from "./types";

const COOKIE = "bp_relmes_embed_user";
const SESSION_VERIFIED = "bp_relmes_embed_verified";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

function cookieFlags(): string {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  return `path=/;max-age=${MAX_AGE_SEC};SameSite=Lax${secure ? ";Secure" : ""}`;
}

export function writeRelmesEmbedUserCookie(user: RelmesEmbedUser): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(user));
  document.cookie = `${COOKIE}=${value};${cookieFlags()}`;
}

export function readRelmesEmbedUserCookie(): RelmesEmbedUser | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  if (!m) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(m[1])) as RelmesEmbedUser;
    if (parsed && typeof parsed.id === "string" && parsed.id) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function clearRelmesEmbedUserCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=;path=/;max-age=0;SameSite=Lax`;
}

/** Set after a valid `relmes:embed:user` from an allowed origin (sessionStorage, same tab). */
export function markRelmesEmbedSessionVerified(): void {
  try {
    sessionStorage.setItem(SESSION_VERIFIED, "1");
  } catch {
    /* ignore */
  }
}

export function hasRelmesEmbedSessionVerified(): boolean {
  try {
    return sessionStorage.getItem(SESSION_VERIFIED) === "1";
  } catch {
    return false;
  }
}
