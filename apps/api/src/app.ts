import "./loadEnv.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDb } from "./db.js";
import authRouter from "./routes/auth.js";
import { User } from "./models/User.js";

let warmPromise: Promise<boolean> | null = null;

function resolveCorsOrigins(): string[] {
  const fromEnv =
    process.env.CORS_ORIGINS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? ["http://localhost:5173"];

  const auto: string[] = [];
  if (process.env.VERCEL_URL) auto.push(`https://${process.env.VERCEL_URL}`);
  if (process.env.VERCEL_BRANCH_URL) auto.push(`https://${process.env.VERCEL_BRANCH_URL}`);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    auto.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  return [...new Set([...fromEnv, ...auto])];
}

export async function warmDb(): Promise<boolean> {
  if (!warmPromise) {
    warmPromise = (async () => {
      const dbOk = await connectDb();
      if (dbOk) {
        try {
          await User.collection.dropIndex("relmesUserId_1");
        } catch {
          // Old single-field index may already be gone.
        }
        try {
          await User.collection.dropIndex("email_1");
        } catch {
          // Global unique email is not part of the embed contract.
        }
        try {
          await User.syncIndexes();
        } catch (err) {
          console.warn("[api] User index sync failed:", err);
        }
      }
      return dbOk;
    })();
  }
  return warmPromise;
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: resolveCorsOrigins(),
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use(async (_req, _res, next) => {
    try {
      await warmDb();
      next();
    } catch (err) {
      next(err);
    }
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "api" });
  });

  app.use("/api/auth", authRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[api] unhandled error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return app;
}

const app = createApp();
export default app;
