# AGENTS.md — portofolio

## Quick start

```bash
npm install          # install dependencies
npx prisma generate  # generate Prisma client after install/schema changes
npx prisma db push   # sync schema to DB (dev)
npx prisma db seed   # seed: node prisma/seed.ts (uses require)
npm run dev          # next dev --turbopack
npm run lint         # next lint (ESLint 9 flat config)
npx tsc --noEmit  # type-check cepat tanpa build penuh
```

## Required env vars

Create `.env` with `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_API_URL`, Supabase storage creds, UploadThing tokens.

## Architecture

- **Next.js 15 App Router** with Turbopack dev server
- Route groups: `(guest)` — public pages, `(admin)` — protected dashboard, `(auth)` — signin/register
- API: `/api/guest/*` (public), `/api/admin/*` (session required), `/api/auth/*` (NextAuth + register)
- **Prisma** + PostgreSQL — models: `Project`, `Post` (BLOG/WRITING type), `Category`, `Tag`, `User`, `Like` (IP-based), `Experience`, `CurrentActivity`, `BucketItem`
- **NextAuth v4** — credentials + GitHub OAuth, JWT strategy, role field in token/session
- **React Query** hooks in `@/hooks/react-query/` — split by domain (`guest/`, `admin/`) then by entity (`blogs/`, `writings/`, `projects/`, `category/`, `tag/`, `about/`, `dashboard/`)
- **Plate editor** (rich text) used for blog/writing/project content
- **shadcn/ui** (New York style) with Tailwind CSS v4, configured in `components.json`

## Key conventions

- Path alias `@/*` → `./src/*`; aliases: `@/components/ui`, `@/lib/utils`, `@/hooks`
- Auth middleware in `src/middleware.ts` protects `/dashboard`, `/profile`, `/admin`; public routes: `/signin`, `/register`, `/`, `/api/auth`
- Post likes/views are **IP-based** (no user login required for public interaction); one like per IP per post
- API routes use **Zod** for input validation and react-hook-form + `@hookform/resolvers/zod` on client forms
- Image uploads: **Supabase storage** (via `SingleImageUploader` / `MultipleImageUploader`)
- ESLint 9 flat config in `eslint.config.mjs` — `react/no-unescaped-entities` off, `react-hooks/exhaustive-deps` off
- **Server data fetchers** di `src/lib/server/` — pure async functions panggil Prisma
  langsung, dipanggil oleh Server Component pages. Pakai `import "server-only"`
  untuk proteksi dari client import. Contoh: `getHomeData` di `get-home-data.ts`.

## Gaya teks (berlaku untuk file baru)

Teks yang tampil ke pengguna tidak memakai em dash (U+2014). Aturan ini berlaku untuk file baru dan baris baru; baris lama yang sudah ada tidak perlu diubah retroaktif.

Pemisah yang dipakai:

- Judul halaman, `<title>`, `openGraph.title`, `twitter.title`: pipe, contoh `"Blog | The Bibi"`
- Metadata inline dan tanggal: middle dot `·`, contoh `"12 Agustus 2026 · Terakhir diperbarui 12 September 2026"`
- `alt` dan `aria-label`: koma, contoh `"Judul, foto 2"`
- Deskripsi dan kalimat: koma, titik dua, atau pecah jadi dua kalimat

Jangan menukar em dash dengan hyphen `-`; yang perlu diperbaiki adalah struktur kalimatnya, bukan karakternya.

Pengecualian yang jangan disentuh: pattern Markdown di `src/components/autoformat-kit.tsx`, berkas di `.agents/skills/**` (vendored, tertimpa saat update), dan arsip `docs/**`. Rentang angka tetap memakai en dash, contoh `Fase 0–5`.

Status per 28 Okt 2026: 16 baris user-facing sudah dibersihkan di 9 file. Sisa 13 kemunculan di `src/` adalah komentar kode, satu pattern autoformat, dan satu dead branch di `src/lib/format-date.ts:52`. Jangan "membersihkan" komentar tanpa diminta.

## Prisma

```bash
npx prisma generate     # after schema changes
npx prisma db push      # dev schema sync
npx prisma db seed      # runs prisma/seed.ts (CommonJS require, skips duplicates)
npx prisma migrate dev  # create + apply migrations
```

Project ignores generated client at `/lib/generated/prisma` (`.gitignore`).

## Notable

- No test framework configured — no test scripts exist
- No CI workflows in `.github/`
- `src/provider/proggres-bar.tsx` (note typo in filename/import) — progress bar provider
- Prisma seed uses `require` (CommonJS), not ESM imports
- Next config allows images from Supabase storage: `https://*.supabase.co/storage/v1/object/public/**`
