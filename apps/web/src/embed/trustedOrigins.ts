import { parseParentOriginAllowlist } from "./parentOrigin";

/** Default postMessage origins for Relmes production + local Next.js shell. */
export const DEFAULT_RELMES_PARENT_ORIGINS = [
  "http://localhost:3000",
  "https://localhost:3000",
  "https://relmes.in",
  "https://www.relmes.in",
  "https://relmes.com",
  "https://www.relmes.com",
] as const;

/**
 * Origins allowed to send `relmes:embed:user`. Env adds/overrides; defaults always included.
 */
export function getRelmesParentOriginAllowlist(): string[] {
  const fromEnv = parseParentOriginAllowlist(import.meta.env.VITE_RELMES_PARENT_ORIGINS);
  return [...new Set([...DEFAULT_RELMES_PARENT_ORIGINS, ...fromEnv])];
}

const TRUSTED_REFERRER_HOSTS = new Set([
  "relmes.in",
  "www.relmes.in",
  "relmes.com",
  "www.relmes.com",
  "localhost",
]);

/**
 * Likely opened from a Relmes shell tab (parent document referrer).
 * Used as a hint only; user payload is still gated by postMessage origin allowlist.
 */
export function isTrustedRelmesReferrer(): boolean {
  if (typeof document === "undefined") return false;
  const ref = document.referrer?.trim();
  if (!ref) return false;
  try {
    const u = new URL(ref);
    const { hostname, port } = u;
    if (hostname === "localhost" && port === "3000") return true;
    return TRUSTED_REFERRER_HOSTS.has(hostname);
  } catch {
    return false;
  }
}
