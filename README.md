# Innovative Generator Parts

The IGP catalogue is now a Next.js 16 B2B generator-parts platform. It preserves the supplied 80 components across eight systems, adds dedicated catalogue URLs, server-side enquiry handling, database-backed administration and a deployment-ready security model.

The prior static prototype remains in the repository during the transition. The Next.js application is the active implementation: `app/`, `components/`, `lib/`, `prisma/` and `public/`.

Product images are maintained in `assets/products/`. `npm run dev` and `npm run build` automatically mirror the 80 WebP files to `public/assets/products/`, which is the directory served by Next.js. Keep each replacement filename unchanged so its catalogue record continues to resolve correctly.

## Stack

- Next.js App Router, React 19 and TypeScript
- PostgreSQL with Prisma
- Stateless signed session cookie with `jose`; `ADMIN`, `EDITOR` and `CUSTOMER` roles
- Zod validation on every server action
- Optional Vercel Blob storage for validated quote attachments
- Vitest for catalogue and validation coverage

## Run locally

Use Node 20.9 or newer. Copy `.env.example` to `.env`, provide a real PostgreSQL connection and set a high-entropy `AUTH_SECRET`.

```sh
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. The public catalogue has a safe read-only fallback to the supplied `data/products.js` when a database is not configured; administration, login and quote persistence require PostgreSQL.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. Required for administration and enquiry storage. |
| `AUTH_SECRET` | At least 32 random bytes, used to sign the HTTP-only session. |
| `APP_URL` | Canonical HTTPS production URL, used for metadata and origin checks. |
| `BLOB_READ_WRITE_TOKEN` | Optional Vercel Blob token for quote attachments. |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Optional initial administrator. The seed refuses example values and passwords below 12 characters. |

Do not commit `.env` or use real credentials in source control.

## Administration

`/login` issues an HTTP-only, secure-in-production, SameSite session cookie. Login attempts are rate-limited in the database. `/admin` requires an `ADMIN` or `EDITOR` role at the server boundary; destructive product deletion is limited to `ADMIN`.

The dashboard supports product creation, editing, draft/published/archive status, duplication, slug redirect records, category management and enquiry status updates. A real SMTP or transactional-email provider must be connected before production launch if email notifications are required; data storage is already implemented.

## Catalogue source and assets

`8 categories.docx` supplied the 80 products and their descriptions. `lib/legacy-catalogue.ts` safely imports `data/products.js` for the initial seed and fallback catalogue, so the source content is retained without hand-copying it. Product assets and the supplied transparent IGP logo are served from `public/assets/`.

Existing records only describe the information supplied in the document. Technical values, verified fitment, commercial promises, company contact details and official product photography still need client approval before they are presented as facts.

## Quality checks

```sh
npm run typecheck
npm run test
npm run build
```

The test suite confirms all 80 supplied products are retained with unique public slugs and exercises core server validation. Build with a production `DATABASE_URL` before release; a migration and seed must succeed against the target database.

## Vercel deployment

1. Import the Git repository in Vercel and set the framework preset to Next.js.
2. Add `DATABASE_URL`, `AUTH_SECRET` and `APP_URL` for Production and Preview as appropriate. Add `BLOB_READ_WRITE_TOKEN` only if attachments should be stored.
3. Run `npx prisma migrate deploy` during the deployment migration step, then run `npm run db:seed` once when initial catalogue data is needed.
4. Confirm the generated sitemap, canonical URLs, quote submission and role access against the deployed site.

`next build` is the build command. The current private static deployment is not a substitute for this server-rendered build because it cannot provide database persistence or authenticated administration.
