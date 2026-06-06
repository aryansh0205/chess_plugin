import type { PublicUser } from "./authApi";

const USER_COOKIE = "bp_user";

function getCookie(name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/** Reads public user JSON from the `bp_user` cookie (set by the API on login/signup). */
export function readUserCookie(): PublicUser | null {
  const raw = getCookie(USER_COOKIE);
  if (!raw) return null;
  try {
    const u = JSON.parse(raw) as PublicUser;
    if (u && typeof u.id === "string" && typeof u.email === "string" && typeof u.name === "string") {
      return u;
    }
    return null;
  } catch {
    return null;
  }
}
