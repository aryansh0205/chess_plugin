import type { CookieOptions, Response } from "express";

export const USER_COOKIE = "bp_user";
export const SESSION_COOKIE = "bp_session";

const maxAgeMs = 7 * 24 * 60 * 60 * 1000;

export function cookieBaseOpts(): CookieOptions {
  const secure = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  return {
    httpOnly: false,
    // Relmes loads plugins in a cross-origin iframe (relmes.com → plugin host).
    sameSite: secure ? "none" : "lax",
    path: "/",
    maxAge: maxAgeMs,
    secure,
  };
}

export function sessionCookieOpts(): CookieOptions {
  return {
    ...cookieBaseOpts(),
    httpOnly: true,
  };
}

export type PublicUser = { id: string; email: string; name: string };

export function clearAuthCookies(res: Response): void {
  const opts = cookieBaseOpts();
  res.clearCookie(SESSION_COOKIE, { path: "/", secure: opts.secure, sameSite: opts.sameSite });
  res.clearCookie(USER_COOKIE, { path: "/", secure: opts.secure, sameSite: opts.sameSite });
}

export function setAuthCookies(res: Response, sessionToken: string, user: PublicUser): void {
  res.cookie(SESSION_COOKIE, sessionToken, sessionCookieOpts());
  res.cookie(USER_COOKIE, JSON.stringify(user), cookieBaseOpts());
}
