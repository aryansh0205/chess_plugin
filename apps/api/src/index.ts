import "./loadEnv.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDb } from "./db.js";
import authRouter from "./routes/auth.js";

const app = express();
const port = Number(process.env.PORT) || 5050;

const corsOrigins =
  process.env.CORS_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? ["http://localhost:5173"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api" });
});

app.use("/api/auth", authRouter);

async function start() {
  const dbOk = await connectDb();
  if (!dbOk) {
    console.warn("[api] Server will start; /api/auth/* returns 503 until MongoDB connects.");
  }
  app.listen(port, () => {
    console.log(`api listening on http://localhost:${port}`);
  });
}

void start();
