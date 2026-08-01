# NestCraft Stabilization Phase 6B.1 — Commerce Mutation Authorization

Date: 2026-07-24
Repository: `/Users/apple/Desktop/WORK/GIT/kalp-os/nestcraft-live`
Branch: `fix/nestcraft-stabilization`
HEAD: `0e598e07ca35ec83b581787cf0e74334ccf79e88`
Authority model: `BUSINESS_CORE_CANONICAL_COMMERCE`
Outcome: `PASS_WITH_EXTERNAL_CONTRACT_BLOCK`

## Executive outcome

The NestCraft-side portion of Phase 6B.1 passes.

- All ten formerly unauthenticated local catalog mutation methods now require
  the same verified commerce-administration policy.
- Five catalog mutation methods that previously checked only for a verified
  token now use the same explicit role policy.
- The policy permits only repository-supported `admin` and `tenant_admin`
  roles.
- Missing, invalid and expired sessions fail as `401 Unauthorized`.
- Verified principals without an approved role fail as `403 Forbidden`.
- Authorization occurs before request-body parsing, MongoDB/model access,
  file writes or proxy forwarding.
- All proxied catalog mutations are guarded before `proxyRequest`.
- Six direct browser-to-external catalog mutation calls now use same-origin
  `/api/commerce/*` endpoints.
- Caller-supplied database headers remain non-authoritative because the
  Phase-5B proxy overwrites them from validated server configuration.
- Successful response bodies, local collection names and commerce data
  behavior were not changed.

The repository does not define a Business Core server/service identity,
authorized tenant claim or downstream commerce-role contract. NestCraft still
forwards existing caller credentials, but that is not proof of downstream
authorization. This portion is `EXTERNAL_CONTRACT_BLOCKED`; no credential,
header or claim was invented.

Credential rotation/revocation remains `NOT CONFIRMED`. This independent
external security block still prohibits push, deployment and baseline
acceptance.

## Starting and ending Git state

Starting state:

- Branch: `fix/nestcraft-stabilization`
- HEAD: `0e598e07ca35ec83b581787cf0e74334ccf79e88`
- Staged changes: none
- Working tree: reviewed Phase 1–6A changes only
- Unrelated changes: none found

Before implementation, Phase 6A was stored as a recoverable Git stash
checkpoint and immediately reapplied:

| Phase | Recoverable checkpoint object |
| --- | --- |
| Phase 1 | `1389df05e8bc288c9ef2ae03a96bc44b4f4ba9a3` |
| Phase 2 | `f981b91a47ed901e2b02d70b41be9faa8497c805` |
| Phase 3 | `c475b383a5e474f6b176d3f51beff29abd9ce705` |
| Phase 4 | `00f78ee3e5cfb20cdf0324deb69b5b089a3d0e43` |
| Phase 5A | `3f6fb68974e27fa588fd889cb30963c71f50179e` |
| Phase 5B | `a0d4df0f8a3e29e20e139ed48230da21b498332d` |
| Phase 6A | `aeddd091a367813728c74b9920c8428320fb7825` |

These are durable recoverable checkpoints, not commits.

Ending state:

- Branch and HEAD unchanged
- Staged changes: none
- Phase 1–6A changes remain present
- Phase 6B.1 changes are uncommitted
- No commit, push, tag, deployment or baseline action occurred

## Authentication and role policy

`lib/commerce-admin.ts` centralizes the NestCraft commerce mutation policy:

1. `authenticateAdmin()` verifies the existing `admin_token` JWT using the
   fail-closed Phase-5A secret boundary.
2. A missing, invalid, expired or unverifiable session returns `401`.
3. A verified JWT whose role is absent or is not `admin`/`tenant_admin`
   returns `403`.
4. An approved role permits the route to continue.

Repository evidence for these role names exists in the login clients,
`docs/ecommerce-audit-report.md`, and the retained ecommerce documentation.
Tokens without a role now fail closed. No new identity source or token format
was introduced.

## Complete local mutation inventory

All local routes remain compatibility surfaces. Applying a guard does not make
local MongoDB canonical commerce authority.

| Route | Methods | Prior state | Phase-6B.1 state | In-repository callers |
| --- | --- | --- | --- | --- |
| `/api/ecommerce/attributes` | POST, PUT, DELETE | Public | Admin role required | DELETE from `attributesThunk`; POST/PUT retained compatibility |
| `/api/ecommerce/attributes/bulk` | POST | Verified token only | Admin role required | `attributesThunk` |
| `/api/ecommerce/categories` | POST, PUT, DELETE | Public | Admin role required | Retained compatibility; Redux mutations now use proxy |
| `/api/ecommerce/categories/bulk` | POST | Verified token only | Admin role required | Retained compatibility; Redux mutation now uses proxy |
| `/api/ecommerce/products` | POST, PUT, DELETE | Public | Admin role required | `CreateProductForm`; `SimpleProductForm` |
| `/api/ecommerce/products/bulk` | POST | Public | Admin role required | Retained compatibility; Redux mutation uses proxy |
| `/api/ecommerce/products/[id]` | PUT, DELETE | Verified token only | Admin role required | `SimpleProductForm`; `EditProductForm` |
| `/api/ecommerce/upload` | POST | Verified token only | Admin role required | `SimpleProductForm` |

This is fifteen local mutation entry points: the ten public methods identified
by Phase 6A plus five previously token-gated methods.

Local reads, cart methods, order methods and the variants read route were not
changed.

## Proxied mutation inventory

`app/api/[[...slug]]/route.ts` now checks all POST, PUT, PATCH and DELETE
requests for these `/api/commerce/*` catalog resource families before proxy
forwarding:

- `products`
- `categories`
- `attributes`
- `attribute-sets`
- `variants`
- `upload`

The guard covers item and bulk subpaths because the resource family is derived
from the first path segment after `commerce`.

Cart, checkout, orders and payment paths are intentionally excluded. Their
financial, ownership and state-transition contracts belong to later Phase 6B
checkpoints.

## Browser caller reconciliation

The direct browser mutation paths found by Phase 6A were:

| Caller | Operations | Before | After |
| --- | --- | --- | --- |
| `lib/store/categories/categoriesThunk.ts` | create, update, delete, bulk | `${NEXT_PUBLIC_API_BASE_URL}/commerce/*` | `/api/commerce/*` |
| `lib/store/attributes/attributesThunk.ts` | create, update | `${NEXT_PUBLIC_API_BASE_URL}/commerce/*` | `/api/commerce/*` |

Static reconciliation finds no remaining browser catalog mutation using
`NEXT_PUBLIC_API_BASE_URL`.

Several admin Redux slices still use the public API base for read-only
attributes, categories, variants and orders requests. Phase 6B.1 authorized
mutation consolidation only; those reads are recorded as remaining surface
consolidation debt and were not changed.

## Local and Business Core responsibility

Under `BUSINESS_CORE_CANONICAL_COMMERCE`:

- Business Core remains the intended catalog mutation authority.
- Same-origin `/api/commerce/*` is the NestCraft adapter surface.
- NestCraft performs its own admin-role boundary check before catalog
  mutations reach the proxy.
- `lib/apiProxy.ts` overwrites `x-tenant-db` with validated server `DB_NAME`.
- Existing `/api/ecommerce/*` mutation routes remain guarded legacy
  compatibility surfaces. Their retirement or migration needs a separate data
  plan.

This checkpoint does not certify downstream enforcement. Repository inspection
found only forwarding of caller `authorization`, `cookie`, `auth-token` and
tenant-context headers. It found no trusted Business Core service identity,
credential authority, role mapping, token issuer/audience contract or
documented tenant-scope validation.

Downstream authorization status: `EXTERNAL_CONTRACT_BLOCKED`.

Required external evidence before claiming end-to-end authorization:

1. Business Core authentication mechanism and credential authority;
2. token/service issuer and audience;
3. commerce-administration role or capability names;
4. authorized tenant-scope claim and validation owner;
5. endpoint-level enforcement tests or service documentation.

## API status changes

| Request class | Previous behavior | Phase-6B.1 behavior |
| --- | --- | --- |
| Anonymous request to ten public local catalog mutations | Could reach validation/database/write logic | `401` before side effects |
| Invalid or expired session | Rejected where old guard existed; otherwise could reach mutation | `401` for every catalog mutation |
| Verified non-admin principal | Token-only guarded routes could proceed | `403` |
| Anonymous/non-admin proxied catalog mutation | Could reach `proxyRequest` | `401`/`403` before forwarding |
| Approved `admin` or `tenant_admin` | Route-specific success/error behavior | Existing behavior preserved |

Successful response shapes and status codes are unchanged. No cart, checkout,
order, payment, pricing or inventory contract was modified.

## Tests and no-side-effect proof

New tests:

- `commerce-admin-policy.test.ts`
  - no session is `401`;
  - customer, missing-role and non-object principals are `403`;
  - `admin` and `tenant_admin` are accepted.
- `catalog-mutation-boundaries.test.ts`
  - all fifteen local catalog mutations reject before database/model access;
  - all proxied catalog resource families reject before forwarding;
  - approved admin forwarding reaches only the mocked intended proxy;
  - direct browser mutation sources use same-origin routes.

Updated tests:

- `mutation-authorization-characterization.test.ts` now proves no local catalog
  mutation remains public.
- `catalog-integrity-characterization.test.ts` supplies an approved admin
  boundary while preserving the previously characterized success shapes and
  financial behavior.

The existing invalid/expired-session tests remain in
`auth-characterization.test.ts`.

No-side-effect evidence:

- rejected local requests produced zero calls to `connectTenantDB`,
  `getProductModel` and `getVariantModel`;
- rejected proxy requests produced zero calls to `proxyRequest`;
- the global test guard rejects native HTTP, HTTPS, TCP, TLS and unmocked
  `fetch` access;
- all 61 tests completed with zero prohibited network attempts.

No MongoDB, Business Core, payment provider or other application service was
contacted.

## Complete Phase-6B.1 changed-file list

Production boundary:

- `lib/commerce-admin.ts`
- `app/api/[[...slug]]/route.ts`
- `app/api/ecommerce/attributes/route.ts`
- `app/api/ecommerce/attributes/bulk/route.ts`
- `app/api/ecommerce/categories/route.ts`
- `app/api/ecommerce/categories/bulk/route.ts`
- `app/api/ecommerce/products/route.ts`
- `app/api/ecommerce/products/bulk/route.ts`
- `app/api/ecommerce/products/[id]/route.ts`
- `app/api/ecommerce/upload/route.ts`
- `lib/store/attributes/attributesThunk.ts`
- `lib/store/categories/categoriesThunk.ts`

Tests and evidence:

- `tests/commerce/commerce-admin-policy.test.ts`
- `tests/commerce/catalog-mutation-boundaries.test.ts`
- `tests/commerce/catalog-integrity-characterization.test.ts`
- `tests/commerce/mutation-authorization-characterization.test.ts`
- `docs/NESTCRAFT-STABILIZATION-PHASE-6B-1-2026-07-24.md`
- `tsconfig.tsbuildinfo` (generated TypeScript verification metadata)

No package manifest, dependency or lockfile was changed by Phase 6B.1.

## Verification

Final verification ran with application credentials/configuration absent:

| Check | Result |
| --- | --- |
| Node | `v22.23.1` |
| npm | `11.11.1` |
| `npm ci` | PASS: 579 packages installed; exit 0 |
| `npm ls next react react-dom --depth=0` | PASS: Next `15.5.21`; React/React DOM `19.2.6` |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 10 files, 61/61 tests |
| Existing Phase-6A-and-earlier tests | PASS: all prior 45 |
| Credential-free `npm run build` | PASS: 16/16 static pages; exit 0 |
| `npm run scan:secrets` | PASS: zero findings |
| `git diff --check` | PASS |
| Static mutation reconciliation | PASS |
| Prohibited application-service/database contact | Zero |

The existing npm installation audit still reports nine findings: one low,
three moderate and five high. No audit fix or dependency remediation was
performed.

## Deliberately unchanged

- Prices, discounts, tax, shipping, subtotals and totals
- Catalog/product data shape and validation
- Inventory and availability
- Cart persistence, ownership and merge behavior
- Checkout and idempotency
- Orders, status transitions and customer access
- Payments, refunds and fulfillment
- MongoDB database and collection selection
- Successful API response contracts
- Business Core credentials, claims and authorization rules
- Direct external read-only admin slices

## Recommended next checkpoint

Do not begin server-authoritative financial repair until the Business Core
contract evidence is supplied.

The next bounded checkpoint should be Phase 6B.2 only after the canonical
Business Core product/variant contract is available. It should validate
published/active state, product-variant relationship and positive integer
quantity bounds without yet implementing price calculation, inventory
reservation, checkout or order creation.

Credential rotation/revocation must also be genuinely confirmed before any
push, deployment or stabilization-baseline acceptance.

## Scope confirmation

- No secret or credential was used, exposed, validated, rotated or reproduced.
- No database or application service was contacted.
- No API success contract, stored commerce data, price, inventory, cart,
  checkout, order or payment behavior changed.
- No Kalp Adapt file, baseline or SiteBridge overlay changed.
- No dependency remediation, `npm audit fix`, commit, push, deployment,
  baseline acceptance or Git-history rewrite occurred.
