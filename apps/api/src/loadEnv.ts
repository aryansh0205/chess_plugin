import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(apiRoot, "../..");

function loadIfExists(full: string): void {
  if (fs.existsSync(full)) {
    dotenv.config({ path: full });
  }
}

/** Monorepo root `.env` first; legacy `apps/api/.env` may still override locally. */
loadIfExists(path.join(repoRoot, ".env"));
loadIfExists(path.join(repoRoot, ".env.local"));
loadIfExists(path.join(apiRoot, ".env"));

export const env = process.env;
