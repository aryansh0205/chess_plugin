import type { Request, Response, NextFunction } from "express";
import { clearAuthCookies, type PublicUser } from "./cookies.js";
import { getRequestUser } from "./session.js";

export type AuthedRequest = Request & { user?: PublicUser };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const user = getRequestUser(req);
  if (!user) {
    if (req.cookies?.bp_session) clearAuthCookies(res);
    res.status(401).json({ error: "sign in required" });
    return;
  }
  req.user = user;
  next();
}
