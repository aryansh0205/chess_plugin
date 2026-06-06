/** Shared API base for the SPA (override with Vite env in real apps). */
export const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

export async function fetchHealth(): Promise<unknown> {
  const path = `${apiBaseUrl}/health`;
  const res = await fetch(path);
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return res.json();
}
