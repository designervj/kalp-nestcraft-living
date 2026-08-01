# NestCraft Stabilization Phase 5B — Authority-Blocked Report

Date: 2026-07-24
Repository: `/Users/apple/Desktop/WORK/GIT/kalp-os/nestcraft-live`
Branch: `fix/nestcraft-stabilization`
HEAD: `0e598e07ca35ec83b581787cf0e74334ccf79e88`
Outcome: `AUTHORITY_BLOCKED`

## Executive decision

Phase 5B stopped before production behavior changes because the repository does
not establish a trusted tenant/database authority.

The repository contains multi-tenant concepts, but it does not prove either:

- an authenticated tenant claim and an authorized tenant-to-database mapping;
- an existing trusted service that performs that mapping; or
- an owner-approved single-tenant, server-configured database authority.

Creating a resolver from the available values would require inventing authority.
That is prohibited by this work order. No tenant resolver, route behavior,
response contract, test behavior, or environment contract was changed.

## Starting Git state and checkpoints

- Branch: `fix/nestcraft-stabilization`
- HEAD: `0e598e07ca35ec83b581787cf0e74334ccf79e88`
- Starting tree: contained only the reviewed Phase 1–5A changes and generated
  TypeScript build metadata; no unrelated changes were found.
- Phase 1 checkpoint: `1389df05e8bc288c9ef2ae03a96bc44b4f4ba9a3`
- Phase 2 checkpoint: `f981b91a47ed901e2b02d70b41be9faa8497c805`
- Phase 3 checkpoint: `c475b383a5e474f6b176d3f51beff29abd9ce705`
- Phase 4 checkpoint: `00f78ee3e5cfb20cdf0324deb69b5b089a3d0e43`
- Phase 5A checkpoint: `3f6fb68974e27fa588fd889cb30963c71f50179e`
- Checkpoint mechanism: recoverable Git stash objects, reapplied to the working
  tree. They are not commits and have not been pushed.

The only Phase-5B file added is this report.

### Ending working-tree state

The ending tree contains the same reviewed Phase 1–5A files, generated
TypeScript build metadata, and this Phase-5B report:

```text
 M app/api/comments/route.ts
 M app/api/ecommerce/cart/route.ts
 M check_users.js
 M create_contact_page.js
 M ecomV2.md
 M ecomV2_updated.md
 M lib/auth.ts
 M lib/db.ts
 M lib/mongodb.ts
 M list_pages.js
 M next.config.ts
 M package-lock.json
 M package.json
 D pnpm-lock.yaml
 M tmp/check_count.js
 M tmp/check_full_doc.js
 M tmp/check_schema.js
 M tmp/import_products.js
 M tmp/import_products_fixed.js
 M tmp/list_dbs.js
 M tmp/seed_categories.js
 M tsconfig.tsbuildinfo
?? .env.example
?? docs/NESTCRAFT-ENVIRONMENT-CONTRACT-2026-07-24.md
?? docs/NESTCRAFT-STABILIZATION-PHASE-1-2026-07-24.md
?? docs/NESTCRAFT-STABILIZATION-PHASE-2-2026-07-24.md
?? docs/NESTCRAFT-STABILIZATION-PHASE-3-2026-07-24.md
?? docs/NESTCRAFT-STABILIZATION-PHASE-4-2026-07-24.md
?? docs/NESTCRAFT-STABILIZATION-PHASE-5A-2026-07-24.md
?? docs/NESTCRAFT-STABILIZATION-PHASE-5B-AUTHORITY-BLOCKED-2026-07-24.md
?? lib/auth-secret.ts
?? scripts/
?? tests/
?? vitest.config.ts
```

No previously reviewed Phase 1–5A file was changed specifically by Phase 5B.

## External rotation/revocation status

`NOT CONFIRMED`

The owner previously confirmed that rotation/revocation was being handled
outside Phase 4. Completion has not been explicitly confirmed. Phase 5A
current-tree containment does not prove external revocation or historical Git
cleanup. The branch therefore remains security-blocked and unpushed.

No credential value was printed, copied, validated, used, removed, rotated, or
tested during Phase 5B.

## Verification precondition

The Phase 1–5A tree was verified with application credentials absent and a
scrubbed application environment under:

- Node: `v22.23.1`
- npm: `11.11.1`
- Next.js: `15.5.21`
- React: `19.2.6`
- React DOM: `19.2.6`
- Vitest: `4.1.10`

Results:

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 579 packages installed |
| `npm ls next react react-dom vitest` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS; 11/11 tests |
| credential-free `npm run build` | PASS; 16/16 static pages generated |
| `npm run scan:secrets` | PASS; zero current-tree findings |
| application database/network attempts | Zero |

The existing npm audit result remains 9 findings: 1 low, 3 moderate, and 5 high.
No audit remediation was attempted; dependency remediation remains separate
from stabilization and commerce-integrity work.

## Tenant-authority classification

Classification: `AUTHORITY_UNRESOLVED`

### Supporting evidence

1. `lib/db.ts` selects the tenant database using
   `NEXT_PUBLIC_TENANT_ID`. Its public prefix makes the value browser-visible;
   it cannot be treated as authorization.
2. `app/api/comments/route.ts` gives the request-controlled `x-tenant-db`
   header priority over `DB_NAME`, then uses a generic hard-coded fallback.
3. `lib/apiProxy.ts` forwards a caller's `x-tenant-db` value and otherwise
   supplies `NEXT_PUBLIC_TENANT_ID`.
4. Browser components, Redux thunks, and service helpers originate
   `x-tenant-db` from public configuration or hard-coded presentation values.
5. `lib/auth.ts` verifies an admin cookie but does not resolve or authorize a
   tenant. The cart session verification consumes `userId`; no tenant claim is
   used for database selection.
6. `models/index.ts` exposes a master `tenants` collection, but no affected
   route uses it to map an authenticated identity to an approved database.
7. Some routes authenticate an administrator before collection access, while
   many affected routes do not authenticate. Even authenticated routes still
   use the same public database selector.
8. The Phase-3 environment contract explicitly records authority as unresolved
   for `DB_NAME`, mixed for `NEXT_PUBLIC_TENANT_ID`, and unresolved for
   `NEXT_PUBLIC_TENANT_DB_NAME`.
9. `kalphelp/ARCHITECTURE.md` describes multi-tenant intent and header
   propagation, but describes the client-controlled header itself as the
   isolation mechanism. It does not define an authenticated claim, allowlisted
   mapping, or trusted resolution service.

Why the other classifications were rejected:

- `SINGLE_TENANT_SERVER_CONFIGURED`: contradicted by the header-driven and
  public-tenant flows; no owner decision identifies one fixed server authority.
- `MULTI_TENANT_AUTH_CLAIM`: no tenant claim schema or claim-to-database mapping
  is implemented or documented.
- `MULTI_TENANT_TRUSTED_SERVICE`: a proxy exists, but it forwards caller input;
  repository evidence does not establish that a trusted service resolves and
  authorizes databases for every local route.

## Current selection flows

### Direct comments flow

`request x-tenant-db` → `DB_NAME` → generic fallback → Mongo database selection

The first value is client-controlled. No authentication or authorization
precedes selection.

### Shared local Mongo flow

`NEXT_PUBLIC_TENANT_ID` → `connectTenantDB()` → model/collection

The same browser-visible presentation identifier directly selects the server
database. Authentication on selected admin routes does not alter or authorize
that value.

### Proxy flow

`request x-tenant-db` → forwarded header, otherwise
`NEXT_PUBLIC_TENANT_ID` → configured backend request

The proxy does not independently authorize the selector.

### After flow

Not implemented. Establishing an after-flow requires the owner decision listed
below.

## Complete affected-route inventory

“Public selector” below means the shared `connectTenantDB()` path currently
uses `NEXT_PUBLIC_TENANT_ID`. “Direct header” means the comments route directly
selects a database from `x-tenant-db`. Unless noted, successful response shapes
and the listed existing status contracts remain unchanged.

| Route | Methods | Authentication | Current database input and selection | Client controlled / fallback | Existing status contracts |
| --- | --- | --- | --- | --- | --- |
| `app/api/comments/route.ts` | GET, POST, PUT, DELETE | None | Direct header, then server `DB_NAME`, then generic fallback | Yes; caller header has priority | implicit 200; PUT/DELETE 400/404; failures 500 |
| `app/api/contact/route.ts` | GET, POST | None | Public selector through inquiry model | Yes, because public configuration is not authority; Mongo driver's default behavior if absent is not an authorization rule | GET implicit 200; POST 201/400; failures 500 |
| `app/api/ecommerce/attributes/bulk/route.ts` | POST | Admin cookie verified before DB access | Public selector through `connectTenantDB()` | Yes; auth token has no tenant mapping | implicit 200; 400/401/500 |
| `app/api/ecommerce/attributes/route.ts` | GET, POST, PUT, DELETE | None | Public selector through `connectTenantDB()` | Yes | implicit 200; PUT/DELETE 400; DELETE 404; failures 500 |
| `app/api/ecommerce/cart/route.ts` | GET, POST, PUT, DELETE | Optional user session; guest session supported | Public selector through cart model | Yes; verified token contributes only user identity, not tenant authority | body status 200; failures 500 |
| `app/api/ecommerce/categories/bulk/route.ts` | POST | Admin cookie verified before DB access | Public selector through `connectTenantDB()` | Yes; auth token has no tenant mapping | implicit 200; 400/401/500 |
| `app/api/ecommerce/categories/route.ts` | GET, POST, PUT, DELETE | None | Public selector through `connectTenantDB()` | Yes | implicit 200; POST/PUT/DELETE 400; PUT/DELETE 404; failures 500 |
| `app/api/ecommerce/orders/route.ts` | GET | Admin cookie verified before DB access | Public selector through order model | Yes; auth token has no tenant mapping | implicit 200; 401/500 |
| `app/api/ecommerce/orders/[id]/route.ts` | PUT | Admin cookie verified before DB access | Public selector through order model | Yes; auth token has no tenant mapping | implicit 200; 401/404/500 |
| `app/api/ecommerce/products/route.ts` | GET, POST, PUT, DELETE | None | Public selector through `connectTenantDB()` | Yes | 200; PUT/DELETE 400; failures 500 |
| `app/api/ecommerce/products/[id]/route.ts` | GET | None | Public selector through `connectTenantDB()` | Yes | 200/404/500 |
| `app/api/ecommerce/products/[id]/route.ts` | PUT, DELETE | Admin cookie verified before DB access | Public selector through product model | Yes; auth token has no tenant mapping | implicit 200; 401/404/500 |
| `app/api/ecommerce/products/bulk/route.ts` | POST | None | Public selector through `connectTenantDB()` | Yes | 200/500 |
| `app/api/ecommerce/variants/route.ts` | GET | Admin cookie verified before DB access | Public selector through variant model | Yes; auth token has no tenant mapping | implicit 200; 401/500 |
| `app/api/pages/route.ts` | GET, POST | None | Public selector through page model | Yes | GET implicit 200; POST 201/400; failures 500 |
| `app/api/pages/[id]/route.ts` | GET, PUT, DELETE | None | Public selector through page model | Yes | implicit 200; GET/PUT/DELETE 404; PUT 400; failures 500 |
| `app/api/[[...slug]]/route.ts` | GET, POST, PUT, PATCH, DELETE | Pass-through only | `lib/apiProxy.ts` forwards caller header or supplies public selector | Yes; downstream authorization is not evidenced locally | preserves downstream status/body; proxy transport failure 500 |

### Other selector-influencing paths

These do not independently prove database authorization, but originate,
propagate, or consume tenant selectors:

- `lib/apiProxy.ts`
- `lib/db.ts`
- `lib/getPageData.ts`
- `lib/getSingleUser.ts`
- `lib/services/orders.ts`
- `lib/store/attributes/attributesThunk.ts`
- `lib/store/auth/authThunks.ts`
- `lib/store/branding/brandingThunks.ts`
- `lib/store/businessBlueprints/businessBlueprintsThunk.ts`
- `lib/store/cart/cartThunk.ts`
- `lib/store/categories/categoriesThunk.ts`
- `lib/store/comments/commentThunk.ts`
- `lib/store/features/adminAttributesSlice.ts`
- `lib/store/features/adminCategoriesSlice.ts`
- `lib/store/features/adminOrdersSlice.ts`
- `lib/store/features/adminVariantsSlice.ts`
- `lib/store/forms/formsThunk.ts`
- `lib/store/pages/pageThunk.ts`
- `lib/store/products/productsThunk.ts`
- `lib/store/users/usersThunk.tsx`
- `lib/store/websiteDetail/websiteDetailThunk.ts`
- `app/[locale]/login/_components/LoginPageClient.tsx`
- `app/[locale]/wishlist/_components/WishlistPageClient.tsx`
- `components/auth/LoginFormSection.tsx`
- `components/contactpage/contactForm/ContactForm.tsx`
- `components/pages/CheckoutPage.tsx`
- `components/homepage/newsletter/Newsletter.tsx`

Collection selection remains fixed inside `models/index.ts`; the unresolved
input is the database, not the collection names.

## Minimum owner decision required

The owner must select and document one authority model before implementation:

### Option A — single-tenant server configuration

Confirm that this deployment is intentionally single-tenant and specify:

1. the server-only configuration authority for the database identifier;
2. whether `DB_NAME` is that authority or a new server-only name is required;
3. the expected behavior for all incoming tenant/database selectors
   (ignore or reject);
4. whether every local database route belongs to the same configured tenant;
5. whether the current public tenant identifier remains presentation-only.

### Option B — authenticated multi-tenancy

Specify:

1. the authoritative authenticated tenant claim and its issuer;
2. the exact claim schema and which cookies/tokens carry it;
3. the trusted tenant-to-database mapping authority;
4. whether the master `tenants` collection is authoritative and how it can be
   consulted without circular tenant selection;
5. the allowlist/mapping lifecycle and failure behavior;
6. which methods permit anonymous/guest access and how those requests obtain a
   trusted tenant context;
7. the required 401/403/404 contract for missing, unknown, and unauthorized
   tenant identity;
8. whether the catch-all proxy resolves authority locally or delegates to a
   named trusted service with a documented contract.

Without this decision, tests for “valid authority” or cross-tenant denial would
encode an invented security model.

## Phase-5B changes and tests

- Production files changed: none.
- Environment contract changed: none.
- Tenant resolver added: none.
- Client-controlled selectors removed or accepted: none.
- API or status-code changes: none.
- Phase-5B tests added: none, because fixtures would require an invented
  authority.
- Existing tests: 11/11 PASS.
- Existing Mongo import-safety, missing-configuration, route-boundary,
  authentication characterization, and secret-scan tests remain passing.
- Cross-tenant isolation: not proven; security work remains blocked.

## Remaining risks

1. A request header directly controls the comments database.
2. A browser-visible value controls all shared local tenant database access.
3. Authenticated admin routes authenticate a user but do not authorize a
   tenant.
4. Multiple unauthenticated mutation routes access tenant collections.
5. The proxy forwards a client database selector without local authorization.
6. Public tenant presentation, database identity, and authenticated tenant
   authority are conflated.
7. Generic and hard-coded fallbacks can mask missing configuration.
8. External credential rotation/revocation remains `NOT CONFIRMED`.
9. Current-tree containment does not remove sensitive history.

## Scope confirmations

- No Kalp Adapt file or baseline changed.
- No SiteBridge overlay was added.
- No MongoDB, Business Core, or other application service was contacted.
- No credential was supplied or used.
- No database/collection selection, API contract, pricing, inventory, cart
  total, checkout, publication authority, or ecommerce behavior changed.
- No identity/tenant service was introduced.
- No dependency or audit remediation was performed.
- No commit, push, deployment, or Git-history rewrite occurred.

After the owner resolves authority and Phase 5B is implemented and verified,
the next stabilization work should be Phase 6 commerce integrity. The nine npm
audit findings must remain separate bounded dependency-remediation work orders
and must not be mixed into pricing, inventory, cart, or checkout correctness.
