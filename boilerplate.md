# Monorepo boilerplate layout (Vite `apps/web`)

This folder is the **self-contained** Turborepo workspace. Run `npm install`, `npm run dev`, and `npm run build` **from `boilerplate/`** (not the repo root).

---

Target shape: Turborepo-style `apps/api` + `apps/web`, with the **web** app using **Vite + React + TypeScript** instead of Next.js `app/` routing.

```
.
├── turbo.json                    # optional Turborepo root
├── package.json                  # workspaces: ["apps/*"]
├── apps
│   ├── api
│   │   ├── .turbo/
│   │   ├── src/
│   │   ├── .env
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web
│       ├── .turbo/
│       ├── public/
│       ├── src
│       │   ├── main.tsx                 # Vite entry (replaces Next root layout bootstrap)
│       │   ├── App.tsx                  # root shell / providers wiring
│       │   ├── index.css                # global styles (like app/globals.css)
│       │   ├── vite-env.d.ts
│       │   ├── providers.tsx            # React Query, theme, auth context, etc.
│       │   ├── components
│       │   │   ├── AgentChatMarkdown.tsx
│       │   │   ├── AgentChatSources.tsx
│       │   │   ├── CreditPricingModal.tsx
│       │   │   └── ResearchDashboard.tsx
│       │   ├── lib                    # fetchers, utils, API client
│       │   ├── types
│       │   ├── auth                   # auth UI + hooks (like app/auth/)
│       │   └── research               # feature route module
│       │       ├── ResearchPage.tsx   # page component (like app/research/page.tsx)
│       │       └── SignOutButton.tsx
│       ├── index.html                 # Vite HTML entry (required; not in Next)
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.mjs
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── package.json
│       └── node_modules/
```

## Next.js (screenshot) → Vite mapping

| Next `app/` | Vite + React |
|-------------|----------------|
| `app/layout.tsx` | `App.tsx` + optional `src/layouts/RootLayout.tsx` |
| `app/page.tsx` | `src/pages/Home.tsx` or route element in your router |
| `app/research/page.tsx` | `src/research/ResearchPage.tsx` + router path `/research` |
| `app/api/*` route handlers | Not in Vite static host — use `apps/api` or serverless |
| `app/auth/*` | `src/auth/*` + same router |

Add **React Router** (or TanStack Router) in `main.tsx` / `App.tsx` if you want file-based URLs like the Next `app` tree.
