import type { Request } from "express";
import { SESSION_COOKIE, type PublicUser } from "./cookies.js";
import { verifySessionToken } from "./jwt.js";

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (typeof header !== "string") return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function getRequestUser(req: Request): PublicUser | null {
  const cookie = req.cookies?.[SESSION_COOKIE];
  if (typeof cookie === "string" && cookie.trim()) {
    const user = verifySessionToken(cookie);
    if (user) return user;
  }
  const token = bearerToken(req);
  if (token) return verifySessionToken(token);
  return null;
}
