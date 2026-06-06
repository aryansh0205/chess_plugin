export type PublicUser = { id: string; email: string; name: string };

const jsonHeaders = { "Content-Type": "application/json" };

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
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok)
    throw new Error(typeof data.error === "string" ? data.error : "Sign up failed");
  return data as { user: PublicUser };
}

export async function login(body: {
  email: string;
  password: string;
}): Promise<{ user: PublicUser }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok)
    throw new Error(typeof data.error === "string" ? data.error : "Sign in failed");
  return data as { user: PublicUser };
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

export async function fetchMe(): Promise<PublicUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  const data = await parseJson(res);
  if (!res.ok) return null;
  const user = data.user;
  if (user && typeof user === "object" && "email" in user) {
    return user as PublicUser;
  }
  return null;
}
