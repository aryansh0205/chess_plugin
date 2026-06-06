import jwt from "jsonwebtoken";
import type { PublicUser } from "./cookies.js";

const secret = () => process.env.JWT_SECRET || "dev-jwt-secret-change-me";

export function signSessionToken(user: PublicUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    secret(),
    { expiresIn: "7d" },
  );
}

export function verifySessionToken(token: string): PublicUser | null {
  try {
    const p = jwt.verify(token, secret()) as jwt.JwtPayload;
    const id = typeof p.sub === "string" ? p.sub : "";
    const email = typeof p.email === "string" ? p.email : "";
    const name = typeof p.name === "string" ? p.name : "";
    if (!id || !email) return null;
    return { id, email, name: name || email };
  } catch {
    return null;
  }
}
