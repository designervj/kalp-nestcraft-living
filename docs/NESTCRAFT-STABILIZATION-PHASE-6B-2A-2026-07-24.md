# NestCraft Stabilization Phase 6B.2A — Business Core Catalog-Contract Readiness

Date: 2026-07-24
Authority model: `BUSINESS_CORE_CANONICAL_COMMERCE`
Outcome: `EXTERNAL_CONTRACT_BLOCKED`

## Executive outcome

Business Core contains substantial catalog, authorization, cart-validation and
inventory implementation. It does not yet expose a complete, versioned
contract that NestCraft can safely use for Phase 6B.2 product, variant and
quantity validation.

The blocking gaps are:

1. no approved NestCraft-to-Business-Core service identity;
2. no token issuer or audience claim/validation;
3. no documented mapping between NestCraft's accepted `admin` role and
   Business Core's catalog capability;
4. no variant lookup endpoint or response contract;
5. no typed/versioned product lookup response in OpenAPI;
6. no separate error contracts for unknown variant and product/variant
   mismatch;
7. no approved general quantity maximum or product-specific limit field;
8. catalog price fields use floating major units while the owner decision
   requires integer INR minor units;
9. no retry, timeout or failure contract for NestCraft;
10. unresolved response and endpoint compatibility gaps between NestCraft and
    Business Core.

No product, variant, quantity, price, inventory, cart, checkout, order or
payment behavior was changed.

## Authoritative sources and Git state

### NestCraft

- Repository:
  `/Users/apple/Desktop/WORK/GIT/kalp-os/nestcraft-live`
- Branch: `fix/nestcraft-stabilization`
- HEAD: `0e598e07ca35ec83b581787cf0e74334ccf79e88`
- Starting working tree: reviewed Phase 1–6B.1 changes, unstaged/untracked
- Unrelated changes: none found
- Phase 1–6A remain recoverable through the checkpoint objects recorded in the
  Phase-6B.1 report
- Phase 6B.1 remains uncommitted

### Business Core

- Repository:
  `/Users/apple/Desktop/WORK/GIT/kalp-os/kalp-business-api`
- Remote: `hideepakrai/kalp-business-api`
- Branch: `main`
- HEAD: `1e2aeba2c7722a723feb1ba268546e404c1adf68`
- Repository identity evidence:
  `apps/api/app/core/config.py` names the application
  `Kalp Business Core API`

Business Core had pre-existing uncommitted provisioning work in:

- `apps/api/app/api/router.py`
- `apps/api/app/core/config.py`
- `apps/api/app/db/models.py`
- `apps/api/app/main.py`
- `apps/api/app/services/platform.py`
- `apps/api/app/tests/conftest.py`
- `docs/DELIVERY_LEDGER.md`
- new provisioning route, schema, service, migration and test files

Those changes were not modified. The commerce routes, commerce models,
commerce schemas, commerce repositories, `core/security.py` and
`core/authz.py` are clean relative to Business Core HEAD. Contract findings
are based on those clean files. The two provisioning-only settings added to
the dirty `core/config.py` diff do not change JWT or commerce semantics.

During this checkpoint, an additional untracked provisioning rehearsal script,
`apps/api/scripts/rehearse_provisioning_postgres.py`, appeared in the Business
Core working tree after the starting status was recorded. Its filesystem
creation time was `2026-07-24T20:54:31+0530`. It was not created, read,
modified or used by this work order. The final commerce/security path check
remained clean.

## Readiness matrix

| Required evidence | Repository evidence | Readiness |
| --- | --- | --- |
| NestCraft authentication mechanism | Business Core accepts bearer JWT, `auth-token` header and auth-token cookies; NestCraft forwards caller credentials | `BLOCKED`: no trusted server/service identity |
| Token issuer and audience | HS256 token generation and verification exist | `MISSING`: no `iss`/`aud` claims or validation |
| Catalog administration capability | `commerce.catalog.manage` exists | `PARTIAL`: no approved NestCraft principal/role mapping |
| Trusted tenant scope | Authenticated tenant resolution is implemented in Business Core | `PARTIAL`: NestCraft service scope is undefined |
| Product lookup endpoint/schema | `GET /commerce/products/{product_id}` exists | `PARTIAL`: response is untyped and missing returns `200 null` |
| Variant lookup endpoint/schema | Internal `CommerceVariant` model exists | `MISSING`: no public lookup endpoint |
| Product/variant relationship | Internal `CommerceVariant.productId` exists | `PARTIAL`: no endpoint contract/test for the relationship |
| Published/active/available meanings | Cart code treats `status == "active"` as available | `PARTIAL`: no separate published/available contract |
| Quantity rules | Request schema requires integer `quantity >= 1` | `PARTIAL`: no maximum or product-specific limit |
| Currency/money | Variant defaults to INR; cart emits integer `unitPriceMinor` | `BLOCKED`: catalog models/requests still use float `price` |
| Error status/shapes | Some route/service errors exist | `BLOCKED`: incomplete and inconsistent matrix |
| Endpoint authorization evidence | Valid tenant-admin catalog tests and general permission tests exist | `PARTIAL`: no service identity or full endpoint role/tenant matrix |
| Retry/timeout/failure behavior | NestCraft proxy uses plain `fetch` | `MISSING`: no timeout/retry contract |
| NestCraft success compatibility | Some product shapes align | `BLOCKED`: route/path/status/body differences remain |

## 1. Authentication mechanism

Current Business Core authentication evidence is in
`apps/api/app/core/security.py`.

Accepted token sources, in precedence order:

1. HTTP `Authorization: Bearer ...`;
2. the `auth-token` request header;
3. tenant-specific `auth_token_{x_tenant_db}` cookie;
4. general `auth_token` cookie.

Tokens are HS256 JWTs verified using Business Core's server-side JWT secret.
Required token payload fields are:

- `id`
- `email`
- `role`
- `exp`

Optional fields are:

- `tenant_id`
- `agency_id`
- `permissions`

NestCraft's `lib/apiProxy.ts` currently forwards caller `authorization`,
`cookie` and `auth-token` values. It does not authenticate itself to Business
Core.

Conclusion: caller credential pass-through is implemented, but the required
trusted NestCraft service identity is undefined. No service account,
client-credential flow, workload identity, signed request or approved token
exchange was found.

## 2. Issuer and accepted audience

`create_access_token()` does not emit `iss` or `aud`.
`decode_access_token()` verifies the signature, algorithm, expiry and Pydantic
payload shape, but does not validate an issuer or audience.

The OpenAPI document describes only a generic HTTP bearer scheme.

Conclusion: issuer and audience are `UNDEFINED`.

Required owner artifact:

- an authentication contract naming the issuer;
- accepted audience;
- signing/key authority and rotation behavior;
- NestCraft service-principal issuance flow;
- token lifetime and replay expectations.

## 3. Catalog administration roles and capabilities

Business Core defines:

- `commerce.catalog.read`
- `commerce.catalog.manage`

Catalog mutation routes require `commerce.catalog.manage`.

Repository grants include:

- `tenant_admin`: catalog read/manage;
- `business_admin`: alias of `tenant_admin`;
- `platform_owner`, `super_admin`, `platform_admin`: all registered
  permissions;
- agency roles: catalog read, not catalog manage;
- staff: catalog read, not catalog manage;
- customer/guest: catalog read, not catalog manage.

NestCraft currently permits local roles `admin` and `tenant_admin`.
Business Core does not define a generic `admin` role in `ROLE_GRANTS`.

Conclusion: `commerce.catalog.manage` is the likely canonical capability, but
the exact NestCraft principal and role-to-capability mapping is not approved.
NestCraft's local `admin` success cannot be assumed to authorize Business Core.

## 4. Tenant-scope claim and validation owner

For authenticated tenant users, Business Core:

1. reads `tenant_id` from the verified token;
2. resolves the tenant through the control database;
3. derives the runtime database name;
4. rejects a conflicting `x-tenant-db` with `403`.

Platform/agency sessions may select a registered tenant through
`x-tenant-db`/`x-tenant-slug`; Business Core resolves the selection and checks
agency ownership.

The validation owner is Business Core's `get_current_session()`, backed by the
Business Core control database and `build_runtime_database_name()`.

The guest fallback still accepts tenant context without establishing a trusted
NestCraft service principal. This may support public catalog reads, but it is
not sufficient authority for catalog mutation or server-to-server validation.

Required owner decision:

- the exact trusted tenant claim carried by the NestCraft service identity;
- whether NestCraft supplies a tenant slug, tenant ID or neither;
- whether `DB_NAME` is transport context only;
- the Business Core component that binds the service principal to the allowed
  tenant.

## 5. Product lookup

Implemented endpoints:

- `GET /commerce/products`
- `GET /commerce/products/{product_id}`
- `GET /commerce/products/slug/{slug}`

All require `commerce.catalog.read`.

The product detail endpoint returns the repository result directly. The
inferred document fields are:

- `id`, `createdAt`, `updatedAt`;
- `name`, `slug`, optional `sku`, `description`;
- `status`, `type`;
- category, attribute-set, collection and related-product identifiers;
- `pricing`, `price`, options and gallery;
- image, manufacturer, vendor, tag and SEO metadata.

Contract limitations:

- no `response_model` is declared;
- generated OpenAPI uses an empty response schema;
- a missing product returns JSON `null` with HTTP `200`, not a defined 404;
- product detail does not include variants;
- filters supplied to product listing are accepted by the route but the
  current repository implementation ignores them and returns all products;
- no API-version identifier is attached to the contract.

Conclusion: an endpoint exists, but its exact response and not-found semantics
are not contract-ready.

## 6–7. Variant lookup and product relationship

The internal model `CommerceVariant` contains:

- `id`, timestamps;
- `productId`;
- `sku`, `title`;
- float `price`, integer `stock`;
- optional compare-at price and image ID;
- `status`;
- `currency`.

The internal relationship is `CommerceVariant.productId` equal to the product
identifier as a string.

No public `/commerce/variants/{id}` endpoint or equivalent variant lookup
endpoint was found. `list_variants_for_products()` exists only as an internal
repository/service operation. Product detail does not return variants.

There is therefore no authoritative external response schema or endpoint-level
test for:

- unknown variant;
- product/variant mismatch;
- variant status and availability lookup;
- product-specific variant limits.

Conclusion: variant evidence is `MISSING` for NestCraft integration.

## 8. Published, active and available semantics

Write schemas permit product and variant statuses:

- `draft`
- `active`
- `archived`

`canonical_cart_item()` currently interprets:

- product `status == "active"` as available;
- variant `status == "active"` as available;
- variant stock greater than or equal to requested quantity as sufficient.

There is no separate `published` field in the product model or cart
validation. There is no separately documented distinction between:

- published;
- active;
- sellable;
- visible;
- available;
- archived.

Products without variants do not receive variant stock enforcement in
`canonical_cart_item()`.

Conclusion: current behavior can be characterized, but the owner-required
published/active/available contract is incomplete.

## 9. Quantity validation

Current evidence:

- add-to-cart schema: integer `quantity >= 1`;
- update-cart schema: integer `quantity >= 0`, where zero removes;
- canonical cart validation checks requested quantity against variant stock;
- order inventory reservation aggregates quantity by variant and uses a
  conditional stock decrement.

Missing evidence:

- approved general maximum `99`;
- product-specific maximum field;
- variant-specific purchase limit;
- policy for products without variants;
- behavior for requested quantity plus an existing cart quantity exceeding
  the limit;
- exact response code for each limit failure.

Conclusion: positive integer validation exists, but Phase 6B.2 quantity policy
is not contract-ready.

## 10. Currency and monetary representation

Partial evidence:

- default variant/cart currency is `INR`;
- cart response emits `unitPriceMinor` as an integer;
- checkout totals use integer `*Minor` fields;
- the cart converts catalog major-unit values by multiplying and rounding.

Conflicting catalog evidence:

- `CommerceProduct.price` is a float;
- `CommerceVariant.price` is a float;
- product/variant write schemas accept float `price`;
- product `pricing` remains a loosely typed object;
- product creation repository code expects legacy `price_minor` and
  `inventory_quantity` keys after the typed request has emitted `price` and
  `stock`, creating an internal schema mismatch.

Conclusion: checkout is moving toward integer minor units, but the catalog
contract does not meet the owner requirement that authoritative money use INR
paise end-to-end.

## 11. Error status and response matrix

This table records current observable source semantics, not an approved
external contract.

| Condition | Current source behavior | Contract readiness |
| --- | --- | --- |
| Unknown product through product lookup | `200` with JSON `null` | `BLOCKED` |
| Unknown product through cart add | `404 {"detail":"Product '<id>' was not found"}` | Partial |
| Unknown variant | Combined with mismatch as `422` | `BLOCKED` |
| Product/variant mismatch | `422 {"detail":"The selected variant does not belong to this product"}` | Partial |
| Draft/archived product | `422 {"detail":"This product is not available"}` | Partial |
| Draft/archived variant | `422 {"detail":"This variant is not available"}` | Partial |
| Quantity less than one on add | FastAPI/Pydantic `422` validation-detail array | Partial |
| Quantity above variant stock | `422` with availability detail | Partial |
| General/product-specific maximum | Not implemented | `MISSING` |
| Missing mutation authentication | `401 {"detail":"Authentication required."}` | Implemented generally |
| Authenticated principal without permission | `403 {"detail":"Permission denied for requested operation."}` | Implemented generally |
| Authenticated tenant with conflicting database | `403` tenant-scope detail | Implemented generally |

The OpenAPI contract does not enumerate these domain error responses or typed
error bodies for product lookup.

## 12. Authorization tests and documentation

Evidence present:

- `test_commerce_slug.py` exercises product create/read/update using a
  tenant-admin bearer token;
- `test_authz.py` proves the permission registry grants catalog read to
  `tenant_admin` and denies unknown/missing grants;
- `test_platform_tenant_role.py` tests registered business selection and
  agency cross-tenant rejection;
- `test_security_tokens.py` rejects signed JWTs missing required payload
  fields.

Evidence missing:

- NestCraft service-principal authentication;
- issuer/audience rejection tests;
- anonymous catalog-mutation endpoint test;
- authenticated non-admin catalog-mutation endpoint test;
- NestCraft service tenant-A versus tenant-B test;
- variant lookup authorization tests;
- endpoint tests for the complete error matrix;
- a versioned Business Core catalog integration document.

Conclusion: authorization implementation has useful tests, but endpoint-level
evidence is incomplete for NestCraft.

## 13. Retry, timeout and failure behavior

NestCraft `lib/apiProxy.ts` currently calls `fetch()` without:

- an abort timeout;
- retry policy;
- retry-safe method classification;
- backoff/jitter;
- circuit-breaking;
- a correlation/request ID contract.

Transport errors become:

```json
{
  "success": false,
  "error": "Failed to connect to backend service"
}
```

with HTTP `500`.

No Business Core catalog SLO, timeout budget, retry guidance or maintenance
failure schema was found.

Required artifact:

- connect/response timeout budget;
- which GET requests may be retried;
- explicit prohibition or idempotency requirement for mutation retries;
- retry count/backoff;
- 429 and `Retry-After` handling;
- 5xx/timeout mapping at the NestCraft boundary;
- correlation identifier propagation.

## 14. NestCraft success-response compatibility

Confirmed compatibility:

- Business Core product create/update responses contain `data`, which
  NestCraft's proxied product save thunk expects.
- Business Core category list returns `categories`, which NestCraft expects.
- Business Core attribute-set list returns `{data,message}`, which NestCraft
  expects.

Unresolved incompatibilities:

1. NestCraft calls `/commerce/attributes` for attribute create/update, while
   Business Core exposes `/commerce/attribute-sets`.
2. NestCraft calls `/commerce/categories/bulk`; no Business Core endpoint was
   found.
3. NestCraft calls `/commerce/products/bulk`; no Business Core endpoint was
   found.
4. Business Core category delete returns `204` with no body, while the
   NestCraft thunk unconditionally parses JSON.
5. Local NestCraft product create succeeds with HTTP `200`; Business Core
   create uses `201`.
6. Local and Business Core category/attribute/product response envelopes are
   not uniformly equivalent.
7. Product detail has no typed variant-inclusive response.
8. Business Core has no versioned compatibility tests using the current
   NestCraft clients.

Required artifact:

- an endpoint mapping and compatibility table approved by both owners;
- response JSON schemas;
- status codes;
- migration version;
- consumer contract tests using NestCraft request/response expectations.

## Remaining local MongoDB catalog-write disposition

The owner decision makes every continuing local catalog write non-canonical.
No write qualifies as `TEMPORARY_READ_PROJECTION`.

| Local route/method | Current in-repository caller | Classification | Required next action |
| --- | --- | --- | --- |
| attributes POST | None after 6B.1 | `RETIRE_AFTER_DATA_MIGRATION` | Prove no external caller; migrate local records |
| attributes PUT | None after 6B.1 | `RETIRE_AFTER_DATA_MIGRATION` | Prove no external caller; migrate local records |
| attributes DELETE | `attributesThunk` | `MIGRATE_TO_BUSINESS_CORE` | Map to attribute-set delete contract |
| attributes/bulk POST | `attributesThunk` | `MIGRATE_TO_BUSINESS_CORE` | Map to Business Core attribute-set bulk |
| categories POST | None after 6B.1 | `RETIRE_AFTER_DATA_MIGRATION` | Reconcile local versus canonical categories |
| categories PUT | None after 6B.1 | `RETIRE_AFTER_DATA_MIGRATION` | Reconcile local versus canonical categories |
| categories DELETE | None after 6B.1 | `RETIRE_AFTER_DATA_MIGRATION` | Reconcile references before retirement |
| categories/bulk POST | None after 6B.1 | `RETIRE_AFTER_DATA_MIGRATION` | Business Core has no matching bulk endpoint |
| products POST | product create forms | `MIGRATE_TO_BUSINESS_CORE` | Use approved product-create contract |
| products PUT | No static caller found | `RETIRE_AFTER_DATA_MIGRATION` | Reconcile local product/variant records |
| products DELETE | No static caller found | `RETIRE_AFTER_DATA_MIGRATION` | Define archival/deletion migration |
| products/bulk POST | No local caller after proxy migration | `RETIRE_AFTER_DATA_MIGRATION` | Business Core has no matching bulk endpoint |
| products/[id] PUT | product edit forms | `MIGRATE_TO_BUSINESS_CORE` | Use approved product-update/variant contract |
| products/[id] DELETE | No static caller found | `RETIRE_AFTER_DATA_MIGRATION` | Define deletion/variant cleanup migration |

These classifications are planning dispositions only. No route may be removed
until:

- local and Business Core record counts/checksums are reconciled;
- external callers are inventoried;
- rollback is defined;
- the Business Core response contract is accepted.

## Exact artifacts and owner decisions needed

Phase 6B.2 remains blocked until Business Core supplies:

1. a versioned NestCraft service-authentication contract;
2. issuer, audience and signing/key authority;
3. service principal plus allowed `commerce.catalog.read/manage`
   capabilities;
4. trusted tenant claim and Business Core binding rules;
5. typed/versioned product lookup response and not-found behavior;
6. typed/versioned variant lookup endpoint and response;
7. explicit product/variant relationship and mismatch behavior;
8. approved status meanings for published, active, archived and available;
9. quantity `1..99` policy plus product/variant-specific limit representation;
10. canonical INR minor-unit catalog fields and migration from floats;
11. a machine-readable domain error catalog for every required condition;
12. endpoint-level service/role/tenant tests;
13. retry, timeout, 429 and transport-failure guidance;
14. a NestCraft compatibility map for endpoint paths, statuses and bodies;
15. a local-Mongo-to-Business-Core migration/retirement plan.

Acceptable artifacts would be a committed OpenAPI contract with typed response
and error schemas, a service-auth/tenant-scope specification, and executable
Business Core contract tests pinned to a commit.

## Verification

NestCraft verification ran under:

- Node `v22.23.1`
- npm `11.11.1`
- application credentials absent

| Check | Result |
| --- | --- |
| `npm ci` | PASS: 579 packages; exit 0 |
| `npm ls next react react-dom --depth=0` | PASS: Next `15.5.21`, React/React DOM `19.2.6` |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 10 files, 61/61 tests |
| credential-free `npm run build` | PASS: 16/16 static pages |
| `npm run scan:secrets` | PASS: zero findings |
| `git diff --check` | PASS |
| database/application-service contact | Zero |

The existing npm audit result remains nine findings: one low, three moderate
and five high. No dependency remediation was performed.

Business Core tests were inspected but not executed because this checkpoint
required no service/database contact and NestCraft's unchanged gates were the
specified verification target.

## Ending state and scope confirmation

- Business Core was not modified.
- The concurrent Business Core provisioning rehearsal file described above
  was not attributed to this work order.
- NestCraft production code was not modified.
- This Phase 6B.2A report is the only authored checkpoint deliverable.
- `tsconfig.tsbuildinfo` remains generated working-tree metadata from the
  required TypeScript/build verification.
- No credential, token or secret value was supplied, printed or tested.
- No database, Business Core runtime or other application service was
  contacted.
- No product, variant, quantity, pricing, inventory, cart, checkout, order,
  payment or API behavior changed.
- No dependency, Kalp Adapt baseline or SiteBridge file changed.
- No commit, push, deployment, baseline acceptance or Git-history rewrite
  occurred.
- Credential rotation/revocation remains `NOT CONFIRMED`.

Phase 6B.2 must not begin until the required artifacts are reviewed and the
readiness outcome becomes `CONTRACT_READY`.
