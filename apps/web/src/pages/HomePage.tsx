import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "@/design";
import { useEmbedUserContext } from "@/embed/EmbedUserProvider";
import { displayUserName } from "@/embed/displayUser";
import { fetchMe, logout } from "@/lib/authApi";
import type { PublicUser } from "@/lib/authApi";
import { readUserCookie } from "@/lib/authCookies";

function DecoLines() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="bg-grid-fine absolute inset-0" />
      {/* Horizon line */}
      <div className="absolute left-0 right-0 top-[52%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      {/* Vertical spine */}
      <div className="absolute bottom-0 left-[18%] top-20 w-px bg-gradient-to-b from-transparent via-accent/40 to-transparent" />
      <div className="absolute bottom-24 right-[14%] top-32 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
      {/* Corner brackets */}
      <div className="absolute left-6 top-6 h-10 w-10 border-l border-t border-border/80" />
      <div className="absolute right-6 top-6 h-10 w-10 border-r border-t border-border/80" />
      <div className="absolute bottom-6 left-6 h-10 w-10 border-b border-l border-border/80" />
      <div className="absolute bottom-6 right-6 h-10 w-10 border-b border-r border-border/80" />
      {/* Accent glows */}
      <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-accent/15 blur-3xl dark:bg-accent/20" />
      <div className="absolute -right-20 bottom-1/4 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      {/* Scan-ish ticks */}
      <div className="absolute left-[18%] top-[calc(52%-6px)] h-12 w-px bg-accent shadow-[0_0_28px_rgb(var(--color-accent)/0.75)] dark:shadow-[0_0_38px_rgb(var(--color-accent)/0.55)]" />
      <div className="absolute right-[calc(14%-10px)] top-32 flex gap-3">
        <span className="h-px w-8 bg-accent/90" />
        <span className="h-px w-16 bg-border" />
        <span className="h-px w-10 bg-fg-muted/40" />
      </div>
    </div>
  );
}

export function HomePage() {
  const {
    user,
    isEmbed,
    hideBoilerplateAuth,
    pluginApiUser,
    pluginSessionSynced,
  } = useEmbedUserContext();
  const { mode, toggleMode } = useTheme();
  const [account, setAccount] = useState<PublicUser | null>(() => readUserCookie());

  useEffect(() => {
    if (isEmbed) {
      if (pluginSessionSynced && pluginApiUser) setAccount(pluginApiUser);
      return;
    }
    void fetchMe().then((u) => {
      if (u) setAccount(u);
    });
  }, [isEmbed, pluginSessionSynced, pluginApiUser]);

  async function onLogout() {
    await logout();
    setAccount(null);
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-page text-fg">
      <DecoLines />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 pb-10 pt-7 sm:px-10">
        <div className="flex flex-wrap items-center gap-8 text-[13px] font-medium uppercase tracking-[0.28em] text-fg-muted">
          <span className="text-fg">Relme</span>
          <span className="hidden h-3 w-px bg-border sm:block" />
          <span className="hidden sm:inline">Developer system</span>
        </div>
        <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            className="rounded-full border border-border bg-surface/85 px-4 py-2 text-sm font-medium text-fg backdrop-blur transition hover:border-accent/70 hover:text-accent"
            to="/"
          >
            Home
          </Link>
          <Link
            className="rounded-full border border-transparent bg-surface/75 px-4 py-2 text-sm font-medium text-fg-muted backdrop-blur transition hover:border-border hover:text-fg"
            to="/research"
          >
            Research
          </Link>
          <button
            type="button"
            className="rounded-full border border-border bg-surface/85 px-4 py-2 text-sm font-medium text-fg-muted backdrop-blur transition hover:border-accent hover:text-fg"
            onClick={toggleMode}
          >
            {mode === "dark" ? "Light" : "Dark"}
          </button>
          {hideBoilerplateAuth ? (
            pluginApiUser ? (
              <span
                className="hidden max-w-[220px] truncate text-sm text-fg-muted sm:inline"
                title={pluginApiUser.email || undefined}
              >
                {pluginApiUser.name}
              </span>
            ) : null
          ) : account ? (
            <>
              <span className="hidden max-w-[200px] truncate text-sm text-fg-muted sm:inline" title={account.email}>
                {account.name}
              </span>
              <button
                type="button"
                className="rounded-full border border-border bg-surface/85 px-4 py-2 text-sm font-medium text-fg backdrop-blur transition hover:border-accent"
                onClick={() => void onLogout()}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                className="rounded-full border border-transparent bg-surface/75 px-4 py-2 text-sm font-medium text-fg-muted backdrop-blur transition hover:border-border hover:text-fg"
                to="/login"
              >
                Log in
              </Link>
              <Link
                className="rounded-full border border-border bg-surface/85 px-4 py-2 text-sm font-medium text-fg backdrop-blur transition hover:border-accent/70 hover:text-accent"
                to="/signup"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20 sm:px-10">
        <div className="relative border border-border/80 bg-surface/60 px-6 py-14 shadow-[0_0_0_1px_rgb(var(--color-border)/0.35)_inset] backdrop-blur-md sm:px-12 sm:py-16 dark:bg-surface/40">
          <div className="pointer-events-none absolute left-0 top-0 h-px w-32 bg-gradient-to-r from-accent to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-px w-40 bg-gradient-to-l from-accent/80 to-transparent" />

          <p className="mb-4 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-fg-muted">
            <span className="h-px w-10 bg-accent" />
            Welcome
          </p>

          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-fg via-fg to-accent bg-clip-text text-transparent dark:from-fg dark:via-accent dark:to-accent/80">
              Relme Developer System
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
            Build and ship plugin experiences inside the Relmes stack—fast Vite tooling, typed APIs, embed
            handshakes, and a canvas that adapts cleanly to light or dark workspaces.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/chess"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:brightness-110 active:scale-[0.99] dark:text-slate-950 dark:shadow-accent/20"
            >
              Play chess
              <span aria-hidden className="text-base leading-none">
                →
              </span>
            </Link>
            <Link
              to="/research"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/85 px-6 py-2.5 text-sm font-semibold text-fg transition hover:border-accent/70 hover:text-accent"
            >
              Open research
            </Link>
            <span className="hidden h-8 w-px bg-border sm:block" />
            <div className="flex flex-wrap gap-3 text-xs text-fg-muted">
              <span className="rounded-full border border-border/90 bg-page/60 px-3 py-1 font-mono tabular-nums">
                Vite + React + TS
              </span>
              <span className="rounded-full border border-border/90 bg-page/60 px-3 py-1 font-mono tabular-nums">
                /health → API
              </span>
              <span className="rounded-full border border-border/90 bg-page/60 px-3 py-1 font-mono tabular-nums">
                Embed ready
              </span>
            </div>
          </div>
        </div>

        {pluginApiUser || account ? (
          <div className="relative mt-10 overflow-hidden rounded-2xl border border-border bg-surface/80 p-6 shadow-sm backdrop-blur-sm sm:p-8 dark:bg-surface/50">
            <div className="absolute right-6 top-6 h-16 w-16 rounded-full border border-dashed border-border/80" />
            <div className="absolute bottom-6 left-8 h-px w-24 bg-gradient-to-r from-accent/80 to-transparent" />
            <p className="text-sm font-semibold text-fg">
              {isEmbed ? "Plugin account (created from Relmes embed)" : "Local session"}
            </p>
            <dl className="mt-4 grid gap-2 text-sm text-fg-muted sm:grid-cols-2">
              <div className="rounded-lg border border-border/70 bg-page/40 px-3 py-2">
                <dt className="text-xs uppercase tracking-wide text-fg-muted/90">Display name</dt>
                <dd className="mt-1 font-medium text-fg">
                  {pluginApiUser?.name || account?.name || displayUserName(user) || "—"}
                </dd>
              </div>
              <div className="rounded-lg border border-border/70 bg-page/40 px-3 py-2">
                <dt className="text-xs uppercase tracking-wide text-fg-muted/90">Username</dt>
                <dd className="mt-1 font-medium text-fg">
                  {user?.username ? `@${user.username.replace(/^@/, "")}` : "—"}
                </dd>
              </div>
              <div className="rounded-lg border border-border/70 bg-page/40 px-3 py-2 sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-fg-muted/90">Plugin email</dt>
                <dd className="mt-1 font-medium text-fg">
                  {pluginApiUser?.email || account?.email || "—"}
                </dd>
              </div>
              <div className="rounded-lg border border-border/70 bg-page/40 px-3 py-2">
                <dt className="text-xs uppercase tracking-wide text-fg-muted/90">Plugin user id</dt>
                <dd className="mt-1 font-mono text-xs text-fg">
                  {pluginApiUser?.id || account?.id || "—"}
                </dd>
              </div>
              <div className="rounded-lg border border-border/70 bg-page/40 px-3 py-2">
                <dt className="text-xs uppercase tracking-wide text-fg-muted/90">Realm</dt>
                <dd className="mt-1 font-mono text-xs text-fg">{user?.serverId || "—"}</dd>
              </div>
            </dl>
          </div>
        ) : (
          !isEmbed && (
            <div className="relative mt-10 overflow-hidden rounded-2xl border border-dashed border-border/90 bg-page/55 px-5 py-6 text-sm leading-relaxed text-fg-muted backdrop-blur-[2px] sm:px-7">
              <div className="absolute -right-px -top-px h-20 w-20 border-l border-t border-accent/35" />
              <p className="max-w-2xl">
                Open this app inside Relmes{" "}
                <code className="rounded-md border border-border bg-surface px-1.5 py-px font-mono text-xs text-fg">
                  /relm
                </code>{" "}
                to receive the embed user payload. Standalone mode has no plugin user until you wire local
                auth.
              </p>
            </div>
          )
        )}
      </main>

      <footer className="relative z-10 border-t border-border/80 bg-page/65 py-8 text-center text-xs text-fg-muted backdrop-blur-sm">
        <div className="mx-auto mb-5 h-px max-w-xl bg-gradient-to-r from-transparent via-border to-transparent" />
        Boilerplate workspace · tune tokens in{" "}
        <code className="rounded border border-border bg-surface px-1 py-px font-mono text-[11px] text-fg">
          src/design
        </code>{" "}
        and styles in{" "}
        <code className="rounded border border-border bg-surface px-1 py-px font-mono text-[11px] text-fg">
          src/index.css
        </code>
      </footer>
    </div>
  );
}
