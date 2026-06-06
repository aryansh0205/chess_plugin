const base = import.meta.env.BASE_URL.replace(/\/$/, "");

function asset(path: `/${string}`): string {
  return `${base}${path}`;
}

/** Audio files under `public/audio/` — add files locally; URLs are centralized here. */
export const audio = {
  /** e.g. `public/audio/notification.mp3` */
  notification: asset("/audio/notification.mp3"),
} as const;
