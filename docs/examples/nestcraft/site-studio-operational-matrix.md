# Kalp Developer Toolkit — Site Studio operational matrix

This matrix describes the reusable, site-agnostic Site Studio toolkit. Nestcraft
is the first local integration example only. Evidence date: 2026-08-14.
“Confirmed” means supported by executable tests or
an inspected implementation contract; it does not mean a deployed environment
was exercised.

| Area | State | Evidence | Smallest repair / next proof |
|---|---|---|---|
| Authentication and tenant permissions | Partial | AdminBar gates edit controls to an explicit operator-role allowlist. The same-origin proxy forwards cookie/authorization and `x-tenant-db`; Business Core requires `publishing.drafts.manage`. | Add an integration test with a running Business Core session for 201/401/403 and align the UI role list with server-issued permissions instead of role names. |
| Page/data loading | Confirmed locally | Public Pages load through `GET /publishing/public/{tenant_slug}/site`; configuration tests verify tenant slug validation and no database-selection header on the public call. | Exercise the configured Nestcraft tenant against the running backend. |
| Media/assets | Partial | Storefront contains a governed ecommerce upload proxy and static/local assets, but inline Page editing only handles text values. | Add a separately authorized media adapter after confirming the canonical Business Core media contract; do not put binary/media mutation through field drafts. |
| Draft/save | Confirmed locally | `@kalp/site-studio-toolkit` posts the backend `PageFieldDraftCreate` payload. Business Core stores deterministic tenant/database-scoped revisions in `site_page_field_drafts`; unit tests cover revisioning, isolation, unsafe paths, and customer denial. | Run an authenticated end-to-end save against local Business Core/Mongo and query the draft through its GET contract. |
| Version history | Partial | Field drafts increment `revision` for the same page/section/path key, but Nestcraft has no history UI or restore operation. | Add read-only history first; define an explicit restore contract before mutation. |
| Publish | Broken / unsupported in this adapter | The draft record sets `publicationAllowed: false`; the inline editor has no publish call. | Connect a reviewed Business Core publication workflow only after approval/permission/preview requirements are defined. |
| Rollback | Unverified for Page field drafts | Business Core has broader Studio rollback capabilities, but no inspected field-draft rollback contract is wired to Nestcraft. | Do not infer compatibility; define draft apply/publication lineage, then expose rollback from that immutable revision history. |
| Pricing | Partial | Storefront renders price data and Business Core has governed pricing services. Inline text draft paths are not a safe pricing authority. | Implement a pricing-specific `MutationAdapter` using the pricing draft/review contract and money validation. |
| Catalog | Confirmed locally for proxy boundary; runtime unverified | Product/category/attribute routes exist; mutations are protected by `authorizeCommerceAdmin`; characterization and consumer-contract tests exist. | Exercise CRUD against a disposable local tenant and reconcile the narrower commerce role allowlist with server permissions. |
| Cart | Confirmed locally | Server-synced cart routes and characterization tests exist; proxy preserves idempotency/session headers and rotates the cart cookie after clear. | Run the complete local guest and signed-in cart journey with Business Core. |
| Checkout | Partial | UI, quote/order/payment-intent boundaries and idempotency header forwarding exist; project guardrails identify checkout/payment/inventory as gated until certified. | Run provider-sandbox end-to-end verification; keep unavailable states explicit without credentials. |
| Integrations/API clients | Partial | A reusable same-origin proxy and public-site client exist. Configuration is split across `FASTAPI_URL`, public API base, tenant slug, and database authority. | Consolidate documented server/public variables and add startup diagnostics; never place database credentials in the toolkit. |
| Configuration | Partial | Database authority validates configured names and public tenant slug validation rejects unsafe values. Several older client thunks still read `NEXT_PUBLIC_TENANT_ID`. | Migrate browser code away from database identifiers toward server-resolved tenant scope. |
| Error/empty states | Partial | Inline saves roll back optimistic state and mark Page error; the adapter returns typed HTTP failures. Catalog/checkout include empty states. The editor has no visible save-progress/error message. | Add accessible pending/success/failure feedback without changing persistence semantics. |
| Developer ergonomics | Confirmed locally | Site Studio has one portable input contract, injectable endpoint/fetch, typed errors, tests, and a generic domain-adapter extension point reusable by every compatible site. | Publish only after ownership/versioning decisions; until then consume by copying/pinning the included package directory or ZIP. |

## Confirmed boundary

The package persists reviewable text field drafts through the already-connected
Business Core backend and its tenant database. It does not apply a draft to the
Page, publish, roll back, upload media, change pricing, or mutate catalog data.
Those require separate governed adapters and must not be represented as working
because the generic extension point exists.
