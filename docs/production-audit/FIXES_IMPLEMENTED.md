# Fixes implemented on the audit branch

- `prisma/seed.ts`, `prisma/seed-catalogue.ts`, `tests/seed-catalogue.test.ts`: an initial import only into an empty catalogue in a transaction with a seed lock; existing catalogue and user roles are not overwritten. This is not a catalog synchronization tool.
- `lib/catalogue.ts`, `components/layout/footer.tsx`, `app/layout.tsx`, `app/page.tsx`, `app/categories/page.tsx`, `tests/catalogue-database.test.ts`: fail closed when production DB is unavailable and don't return old legacy entries for a successful DB miss. Public products require published categories. The footer omits categories on a DB outage; the DB-driven layout is dynamic so builds don't bake in stale links.
- `app/sitemap.ts`, `tests/sitemap.test.ts`: include all catalogue pages. `app/products/[slug]/page.tsx`: redirect old product slugs to the current slug.
- `lib/auth.ts`, `tests/auth-role.test.ts`: check the user's current role and existence for protected actions, and serialize per-key rate-limit checks using transaction-scoped advisory locks.
- `lib/storage/uploads.ts`, `app/actions.ts`, `tests/enquiry-action.test.ts`: generate extensions from validated MIME type, sanitize display filenames, and remove the newly uploaded file only after a definitive rejected database insert. Retain files when commit status is uncertain.
- `.env.example`: clarify that sessions are signed rather than encrypted and that seeding leaves existing users unchanged.

None of these changes was deployed. Database migrations, real uploads, real user actions, email delivery and account changes were not performed. See the audit report for limitations and remaining risks.
