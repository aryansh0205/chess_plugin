import { defineConfig } from "tsup";

export default defineConfig({
  entry: { vercel: "src/vercel.ts" },
  outDir: "dist",
  format: ["esm"],
  platform: "node",
  target: "node20",
  bundle: true,
  splitting: false,
  sourcemap: true,
  clean: false,
  external: [
    "bcryptjs",
    "cookie-parser",
    "cors",
    "dotenv",
    "express",
    "jsonwebtoken",
    "mongoose",
  ],
});
