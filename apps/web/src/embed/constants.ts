/** Contract between Relmes parent shell and embedded plugins (iframe). */

export const RELMES_EMBED_READY = "relmes:embed:ready" as const;
export const RELMES_EMBED_USER = "relmes:embed:user" as const;
/** Parent (/relm) → iframe: sync light/dark with Relm shell. */
export const RELMES_EMBED_THEME = "relmes:embed:theme" as const;

/** Parent → iframe: go back one in-plugin page. */
export const RELMES_EMBED_NAV_BACK = "relmes:embed:nav-back" as const;
/** iframe → parent: whether in-plugin back is available. */
export const RELMES_EMBED_NAV_STATE = "relmes:embed:nav-state" as const;
