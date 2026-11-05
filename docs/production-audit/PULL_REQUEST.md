# Draft pull request: Harden catalogue, access and enquiry handling

## Summary

The initial seed previously overwrote client-managed catalogue data, production database outages could expose legacy catalogue records, and signed admin sessions kept their original role after an account was changed. This branch makes the import empty-database-only, fails closed for production catalogue errors, and checks current account permissions. It also serializes per-identifier rate limits, cleans up files after definitively rejected enquiry writes, paginates the sitemap and redirects renamed product URLs.

## Verification

- `npm ci`: passed, no audit findings reported.
- `npm run typecheck`: passed.
- `npm test`: 30 tests passed using mocks for external services.
- `npm run build`: passed with database and Blob credentials withheld.
- `npm run build:vinext`: passed before the clean install, with warnings; Worker runtime unverified.
- Production settings, Neon transactions, private Blob end-to-end behavior and full responsive coverage remain unverified. Legal/business content and several security/operational items remain open. See the audit report and remaining actions before considering release.

Do not merge or deploy without explicit authorization and completion of release checks.
