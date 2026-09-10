/**
 * API base URL for fetch calls.
 * - Dev: empty → same-origin `/api/...` through Vite proxy
 * - Prod: set VITE_API_URL in root `.env` / Vercel env
 */
export const apiBaseUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "") ?? "";

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalized}` : normalized;
}
