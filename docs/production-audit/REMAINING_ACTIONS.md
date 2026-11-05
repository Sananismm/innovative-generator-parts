# Remaining launch actions

**Launch is blocked pending completion and verification.**

- Company/legal: approved privacy notice and terms reflecting actual data, uploads, storage providers, retention, access, rights, contact process and applicable law; any applicable sales/returns/warranty/delivery terms. Obtain legal review.
- Company: provide an approved public address, if any, and business hours; verify claims, product descriptions and rights to images. Provide owner, staff roles and enquiry response expectations. Business name, phone, WhatsApp number, email and service area have been supplied and added to the audit branch.
- Infrastructure owner: grant appropriate read-only project inspection or independently verify Vercel settings, production branch, deployments, environments, domain, DNS/TLS, preview indexing protection, private Blob configuration, billing and monitoring. Preserve Websouls mail records.
- Engineering: establish separate Neon and private Blob test resources; verify login, permissions, session revocation strategy, real rate-limit concurrency, catalogue edits and redirects, database outage and recovery, quote idempotency, uploads, retries, cleanup and authorized downloads. Review transaction compatibility on the intended Vercel and/or Worker runtime.
- Engineering/security: design safe orphan reconciliation and retention; review product slug update transaction/collisions; address rate limits across changing identifiers and password-reset/session revocation. Verify no secret appears in build artifacts shared outside the machine.
- QA: test the 80 products, categories and links; complete full-page 375/768/1024/1440 checks, keyboard, browser engines, real device and staging Lighthouse/field metrics. Only the top of the live catalogue received a limited breakpoint check in this audit.
- Operations: document and exercise backup, restore, migrations, monitoring, response procedures and rollback; verify no secrets are committed and avoid copying `dist/server/.dev.vars`.
- Owner: review and approve the branch and final deployment plan. No production migration, seed, deploy, merge or DNS change is authorized by this document.
