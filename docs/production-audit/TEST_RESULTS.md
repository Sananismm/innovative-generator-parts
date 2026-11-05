# Test results

Execution date: 5 November 2026. All database and storage failure tests used mocks. The build commands explicitly set the database URL and Blob token to empty values for the child process and use a localhost example origin; no production database or Blob transaction was intentionally performed.

| Check | Result |
|---|---|
| `npm ci` | PASS: 285 packages installed, zero audit findings reported. |
| `npm run typecheck` | PASS after the clean dependency install. |
| `npm test` | PASS after the clean dependency install: 30 tests in nine files. |
| `npm run build` | PASS after clean install; Next.js 16.4.3 and Prisma Client 6.19.3. An earlier attempt failed because the footer accessed the unavailable database during static prerender; fixed by dynamic rendering and footer error handling. |
| `npm run build:vinext` | PASS before clean reinstall; emitted source-map, dynamic-import and route-classification warnings. This is a build only, not Worker runtime validation. |
| `npm audit --omit=dev` | PASS: zero reported vulnerabilities at execution time. |
| `npx prisma validate` | PASS with an example local URL; schema validation does not connect to Neon. |
| `git diff --check` | PASS for checked source changes; Git emitted only a line-ending notice. |
| Live browser | Homepage and the top of the catalogue rendered; 80 components shown. The catalogue top was viewed at 375, 768, 1024 and 1440 CSS px; measured document scroll width was no wider than the viewport and loaded images reported no failures. Screenshots were viewed in the tool but not saved as artifacts. No production submissions were made. |
| Full-page responsive QA, Playwright suite, Lighthouse, accessibility, cross-browser and local visual comparison | NOT RUN in this audit; the limited viewport check above does not establish complete coverage. |
| Real Neon transactions, migrations, Blob access/cleanup, authorized admin CRUD, 80 product routes and end-to-end quote workflow | NOT RUN: isolated test services and safe test accounts were not established. |
| Vercel settings and deployment logs | NOT VERIFIED: project listed, detail returned 404 and deployments 403 to connected account; CLI unavailable. |

The Worker build wrote ignored `dist/server/.dev.vars` derived from local environment configuration; treat build output as sensitive and exclude it from uploads and distribution. It also removed tracked legacy `dist` files as part of its output cleanup; those tracked files were restored from the unchanged branch base after the build.
