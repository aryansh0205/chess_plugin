export type PublicUser = { id: string; email: string; name: string };

import { apiUrl } from "./apiBase";
import { authHeaders, clearSessionToken, storeSessionToken } from "./sessionToken";

const jsonHeaders = { "Content-Type": "application/json" };

function persistToken(data: Record<string, unknown>): void {
  if (typeof data.token === "string" && data.token.trim()) {
    storeSessionToken(data.token);
  }
}

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function signup(body: {
  email: string;
  password: string;
  name: string;
}): Promise<{ user: PublicUser }> {
  const res = await fetch(apiUrl("/api/auth/signup"), {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok)
    throw new Error(typeof data.error === "string" ? data.error : "Sign up failed");
  persistToken(data);
  return data as { user: PublicUser };
}

export async function login(body: {
  email: string;
  password: string;
}): Promise<{ user: PublicUser }> {
  const res = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok)
    throw new Error(typeof data.error === "string" ? data.error : "Sign in failed");
  persistToken(data);
  return data as { user: PublicUser };
}

export async function loginWithEmbed(body: {
  id: string;
  serverId: string;
  email?: string;
  fullname?: string;
  username?: string;
  userId?: string;
}): Promise<{ user: PublicUser }> {
  const res = await fetch(apiUrl("/api/auth/embed"), {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Relmes sign in failed");
  }
  persistToken(data);
  return data as { user: PublicUser };
}

export async function logout(): Promise<void> {
  clearSessionToken();
  await fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include" });
}

export async function fetchMe(): Promise<PublicUser | null> {
  const res = await fetch(apiUrl("/api/auth/me"), {
    credentials: "include",
    headers: authHeaders(),
  });
  const data = await parseJson(res);
  if (!res.ok) return null;
  const user = data.user;
  if (user && typeof user === "object" && "email" in user) {
    return user as PublicUser;
  }
  return null;
}
