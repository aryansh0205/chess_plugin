/** Contract between Relmes parent shell and embedded plugins (iframe). */

export const RELMES_EMBED_READY = "relmes:embed:ready" as const;
export const RELMES_EMBED_USER = "relmes:embed:user" as const;
/** Parent (/relm) → iframe: sync light/dark with Relm shell. */
export const RELMES_EMBED_THEME = "relmes:embed:theme" as const;
