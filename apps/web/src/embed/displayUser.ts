import type { RelmesEmbedUser } from "./types";

/**
 * Best label to show for the Relmes user (iframe payload).
 * Prefers full name, then username handle, then email, then id.
 */
export function displayUserName(user: RelmesEmbedUser | null | undefined): string {
  if (!user) return "";
  const full = user.fullname?.trim();
  if (full) return full;
  const handle = user.username?.trim();
  if (handle) return handle;
  const email = user.email?.trim();
  if (email) return email;
  return user.id?.trim() || "";
}
