# CLAUDE.md — AI Blogging Frontend

Guide for working in this repo. Keep it current when architecture changes.

## What this is
Next.js 15 (App Router) frontend for the AI blogging platform: a public editorial
blog plus an **admin panel** for managing posts, taxonomy, AI generation, scheduling,
and analytics. Talks to the Express API in `../ai-blogging-backend`.

## Stack
- **Next.js 15.1 (App Router)** + **React 19** + TypeScript (strict)
- **NextAuth v5 (Auth.js beta)** — JWT sessions, Google + Credentials providers
- **@tanstack/react-query 5** for client data/mutations; **axios** client
- **react-hook-form** + **zod** (`@hookform/resolvers`) for forms
- **Tailwind CSS 4** (+ `@tailwindcss/typography`), **CVA** for variants,
  design tokens in `src/styles/globals.css`
- **Radix UI** primitives (dialog, dropdown, label, slot), **lucide-react** icons
- **react-markdown** (+ remark-gfm, rehype-*) renders post content
- **Tiptap** (installed, available for rich editing), **recharts** (charts),
  **sonner** (toasts), **next-themes** (dark mode via `.dark` on `<html>`)

## Run
```bash
npm run dev        # next dev (localhost:3000)
npm run build      # next build
npm run start      # production server
npx tsc --noEmit   # typecheck
```
Env in `.env.local` (see `.env.example`). Key vars: `NEXT_PUBLIC_API_URL`
(backend base, **no /api prefix**), `AUTH_SECRET`, `AUTH_GOOGLE_ID/SECRET`
(must match backend's Google client), `REVALIDATE_SECRET` (must match backend).
NextAuth reads env **only at startup — restart dev after changing `.env.local`.**

## Layout
```
src/
  app/
    (public)/     # blog, post detail, category/tag/author, search, static pages + layout
    (auth)/login  # sign in / register
    (admin)/      # admin panel — layout.tsx gates auth; admin/<section>/page.tsx
    api/          # auth/[...nextauth], revalidate (ISR webhook), og image
  components/
    ui/           # design-system primitives (button, input, label, badge, card,
                  #   table, textarea, select, dialog, tabs, switch, skeleton…)
    admin/        # admin panel components (AdminSidebar, PostForm, per-section clients)
    public/       # blog UI (Header, PostCard, MarkdownContent, Pagination…)
    shared/       # Providers (Auth+Query+Theme+Toaster), ThemeToggle
    auth/         # LoginForm
  lib/
    auth.ts       # NextAuth instance: handlers, auth(), signIn/out, callbacks
    auth.config.ts# edge-safe config (used by middleware.ts) — authorized() gates /admin
    api/          # client.ts (axios+Bearer), server.ts (fetch+ISR), + per-domain clients
    query-keys.ts # TanStack query key factory
    utils.ts      # cn()
  hooks/          # useAuth, usePosts, useCategories, useAi, useScheduler
  types/          # models.ts, api.ts, auth.ts, next-auth.d.ts, index.ts
```

## API layer — two clients
- **`lib/api/client.ts`** (axios, `"use client"` paths): `baseURL = NEXT_PUBLIC_API_URL`,
  `withCredentials`. A request interceptor auto-attaches `Authorization: Bearer
  <accessToken>` from the NextAuth session (cached 30s); 401 → signs out. Helpers
  `unwrap<T>` (→ `data.data`) and `unwrapList<T>` (→ `{ items, meta }`).
- **`lib/api/server.ts`** (`server-only`, native fetch + Next cache): `serverFetch`,
  `serverFetchList`, `serverFetchOrNull` with `revalidate`/`tags` for ISR.
- Per-domain clients (reuse these — don't re-fetch raw): `posts.ts` (`postsApi`),
  `categories.ts` (`categoriesApi`, `tagsApi`), `ai.ts` (`aiApi`), `scheduler.ts`
  (`schedulerApi`), `auth.ts` (`authApi`), `newsletter.ts`, `public.server.ts`.
- Errors normalize to `ApiError` (`lib/api/errors.ts`); `fieldErrors(err)` extracts
  Zod field errors for `form.setError`.

## Auth & role gating
- Server components: `const session = await auth()` (`@/lib/auth`); `session.user.role`
  is `"ADMIN" | "EDITOR"`, `session.accessToken` is the backend JWT.
- Client: `useAuth()` (`@/hooks/useAuth`) → `{ user, role, accessToken, isAuthenticated,
  isAdmin, isEditor, isLoading }`.
- `middleware.ts` runs `authorized()` on `/admin/:path*` (redirects anon to `/login`).
  Admin pages/layout also re-check with `auth()` (belt + suspenders).

## Conventions for new pages
1. Route = **Server Component** `page.tsx`; call `auth()`, redirect if unauthorized;
   render a `"use client"` component for interactivity.
2. Data via existing react-query hooks (`useAdminPosts`, `useCategories`, …); mutations
   invalidate `queryKeys.*`.
3. Forms: react-hook-form + zodResolver, mirror `components/auth/LoginForm.tsx`;
   surface errors with `fieldErrors()` + `toast`.
4. Style with `var(--color-*)` tokens (background, foreground, primary, muted, border,
   card, accent, ring) so light/dark both work. No `destructive` token — use red-* for
   dangerous actions. Merge classes with `cn()`.
5. Import via `@/` alias. Co-locate admin components under `components/admin/`.

## Rendering / caching
Public pages are Server Components with ISR (`export const revalidate`) and resilient
`.catch()` fallbacks. Post content is Markdown, rendered by
`components/public/MarkdownContent.tsx` (`{content}` prop) — reuse it for admin preview.
Backend mutations POST `/api/revalidate` (secret-guarded) to invalidate cache tags.

## Gotchas
- Backend has **no `/api` prefix** — `NEXT_PUBLIC_API_URL` points at the root.
- Restart `next dev` after `.env.local` changes.
- Google OAuth: the Console client needs redirect `…/api/auth/callback/google` and
  origin for the running host, and `AUTH_GOOGLE_ID` must match the backend's
  `GOOGLE_CLIENT_ID` (backend verifies the id_token audience).
