import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** `apps/api` directory — stable even when Turbo/npm cwd is the monorepo root. */
const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Load env files in order; later files override earlier ones.
 * - `.env.example` — team defaults / template (optional)
 * - `.env` — local secrets (optional; usually gitignored)
 *
 * Many editors only update `.env.example`; without a `.env`, nothing was loaded before.
 */
function loadIfExists(rel: string): void {
  const full = path.join(apiRoot, rel);
  if (fs.existsSync(full)) {
    dotenv.config({ path: full });
  }
}

loadIfExists(".env.example");
loadIfExists(".env");
