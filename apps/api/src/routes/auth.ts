import { Router } from "express";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { signSessionToken, verifySessionToken } from "../auth/jwt.js";
import {
  SESSION_COOKIE,
  clearAuthCookies,
  setAuthCookies,
  type PublicUser,
} from "../auth/cookies.js";

const router = Router();

router.use((_req: Request, res: Response, next) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      error:
        "Database unavailable. Copy apps/api/.env.example to apps/api/.env, set MONGO_URI, and ensure MongoDB is running.",
    });
    return;
  }
  next();
});

const SALT_ROUNDS = 10;

function publicUserFromDoc(doc: { _id: { toString(): string }; email: string; name: string }): PublicUser {
  return { id: doc._id.toString(), email: doc.email, name: doc.name };
}

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    const name = String(req.body?.name ?? "").trim();

    if (!email || !password || !name) {
      res.status(400).json({ error: "email, password, and name are required" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "password must be at least 8 characters" });
      return;
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      res.status(409).json({ error: "an account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const created = await User.create({ email, passwordHash, name });
    const user = publicUserFromDoc(created);
    const token = signSessionToken(user);
    setAuthCookies(res, token, user);
    res.status(201).json({ user });
  } catch (e) {
    console.error("signup", e);
    res.status(500).json({ error: "could not create account" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const doc = await User.findOne({ email });
    if (!doc) {
      res.status(401).json({ error: "invalid email or password" });
      return;
    }

    const ok = await bcrypt.compare(password, doc.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "invalid email or password" });
      return;
    }

    const user = publicUserFromDoc(doc);
    const token = signSessionToken(user);
    setAuthCookies(res, token, user);
    res.json({ user });
  } catch (e) {
    console.error("login", e);
    res.status(500).json({ error: "could not sign in" });
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  clearAuthCookies(res);
  res.json({ ok: true });
});

router.get("/me", (req: Request, res: Response) => {
  const raw = req.cookies?.[SESSION_COOKIE];
  if (typeof raw !== "string" || !raw.trim()) {
    res.status(401).json({ user: null });
    return;
  }
  const user = verifySessionToken(raw);
  if (!user) {
    clearAuthCookies(res);
    res.status(401).json({ user: null });
    return;
  }
  res.json({ user });
});

export default router;
