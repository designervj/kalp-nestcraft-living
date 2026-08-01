# NestCraft Stabilization Phase 6B.2B Report

Date: 2026-07-24
Outcome: **KALP_ALIGNMENT_BLOCKED**

| Dimension | Authoritative Phase 6B.2B result |
| --- | --- |
| `ISOLATED_CONTRACT_DESIGN` | `READY` |
| `KALP_PLATFORM_ALIGNMENT` | `BLOCKED` |
| `PLATFORM_IDENTITY_ALIGNMENT` | `BLOCKED` |
| `RUNTIME_IMPLEMENTATION_READY` | `NO` |

Phase 6B.2B defines and executes the versioned Business Core catalog
integration contract without activating it. No NestCraft production cart,
catalog, authentication, tenant, pricing, inventory, checkout, order, or
payment behavior changed.

The provider and consumer design schemas remain mechanically coherent and
their isolated tests agree. The mandatory Kalp optimization alignment review
supersedes the earlier readiness conclusion: workload-identity authority,
error/correlation conventions, and API lifecycle compatibility are not
accepted platform decisions, so the contract cannot yet be finalized.

Credential rotation/revocation remains **NOT CONFIRMED**. Push, deployment, and
baseline acceptance therefore remain blocked.

## Mandatory Kalp optimization and Kalp Adapt alignment gate

Alignment outcome: **KALP_ALIGNMENT_BLOCKED**
Blocking classification: **PLATFORM_IDENTITY_ALIGNMENT_BLOCKED**
Optimization-baseline impact: **NONE**

NestCraft and Business Core commerce stabilization is a coordinated lane
inside the Kalp optimization process:

```text
Kalp optimization decisions ─┐
Kalp Adapt contracts ────────┼─> alignment gate
Business Core provider ──────┤      ├─> contract-ready decision
NestCraft consumer ──────────┘      └─> separate follow-up work orders
```

The review inspected the current optimization index and gates, Adapt
architecture/contracts, Admin auth/tenant/permission helpers, the repository
capability registry, Business Core v2/error/audit conventions, KCP accepted
decisions, and the unapproved PostgreSQL compatibility record.

The resulting decisions are:

| Concern | Alignment decision |
| --- | --- |
| Service identity | **BLOCKED.** Adapt is not an identity authority. Business Core is the intended but still `PARTIAL` user/tenant/permission authority. No accepted workload issuer exists. |
| Tenant identity | Reuse Business Core's canonical tenant ID and server-owned mapping; finalize service-principal binding with identity. |
| Permissions | Reuse `commerce.catalog.read` and `commerce.catalog.manage`; NestCraft roles never grant provider permissions directly. |
| Product/variant IDs | Business Core identifiers remain canonical; no supported shared DTO package currently exists. |
| Money | INR integer minor units align with current direction, but float-backed catalog data still requires migration evidence. |
| Errors | Proposed typed errors conflict with current Business Core v2 `ApiError`/route conventions; a platform contract decision is required. |
| Correlation/audit | Business Core remains audit owner, but one cross-service correlation convention is not yet accepted. |
| API lifecycle | Proposed `/v1/catalog` must be reconciled with Business Core's existing `/v2` envelope, pagination, and lifecycle conventions. |
| Retry/idempotency | Bounded safe-read retries align; mutations still require an explicit idempotency contract. |
| Data evolution | Business Core owns canonical migration; NestCraft owns adapter/legacy retirement; Adapt may analyze evidence but does not migrate. |

The proposed issuer `urn:kalp:business-core` is now explicitly a **candidate**,
not a final authority. If a separately approved Kalp identity service owns
workload identity, Business Core must validate that issuer instead of creating
a second token authority.

Required separate work orders:

1. Platform Security/Architecture: approve one Kalp workload-identity issuer,
   validator, JWKS/key-rotation, registration, revocation, and tenant-binding
   authority.
2. Platform Contract + Business Core: reconcile errors, correlation,
   pagination, and API version lifecycle with existing v2 conventions.
3. Business Core Commerce/Data: validate the minor-unit migration.
4. Business Core Commerce: implement runtime provider endpoints only after the
   first three decisions pass.
5. NestCraft: implement the consumer adapter only against the passing provider.
6. Kalp Adapt: separately propose any contract/runtime evidence collectors or
   rules; do not alter scoring or a baseline in this checkpoint.

The full evidence matrix, latest-practice classification, owners, dependencies,
and future work-order proposals are recorded in
`kalp-business-api/docs/contracts/catalog-integration/v1/kalp-alignment-report.md`.
Kalp Adapt, Kalp Admin, shared packages, optimization ledgers, PostgreSQL
baselines, SiteBridge, KCP, and all optimization baselines were inspected
read-only and not changed.

## Repository state

### Business Core

- Repository: `/Users/apple/Desktop/WORK/GIT/kalp-os/kalp-business-api`
- Starting and ending branch: `main`
- Starting and ending HEAD:
  `1e2aeba2c7722a723feb1ba268546e404c1adf68`
- Staged changes: none
- Commit, push, tag, and deployment: none

The starting tree contained unrelated concurrent provisioning work. It was
preserved. The untracked
`apps/api/scripts/rehearse_provisioning_postgres.py` was not read, modified,
executed, staged, or attributed to this checkpoint.

During this checkpoint,
`apps/api/app/repositories/platform.py` also appeared modified in the shared
working tree. It was treated as concurrent unrelated work and was not read or
modified for Phase 6B.2B. A scoped reconciliation found zero pre-existing or
new runtime commerce/security changes in:

- `apps/api/app/api/routes/commerce.py`
- `apps/api/app/core/security.py`
- `apps/api/app/core/authz.py`
- `apps/api/app/models/commerce/`
- `apps/api/app/services/commerce/`
- `apps/api/app/repositories/commerce/`

### NestCraft

- Repository: `/Users/apple/Desktop/WORK/GIT/kalp-os/nestcraft-live`
- Starting and ending branch: `fix/nestcraft-stabilization`
- Starting and ending HEAD:
  `0e598e07ca35ec83b581787cf0e74334ccf79e88`
- Staged changes: none
- Commit, push, tag, deployment, and baseline action: none
- Starting tree: reviewed, accumulated Phase 1–6B.2A changes only
- Ending tree: the same accumulated work plus two consumer contract artifacts
  and this report

Phases 1–6A remain recoverable through the existing Git stash objects:

| Phase | Recoverable object |
| --- | --- |
| 1 | `1389df05e8bc288c9ef2ae03a96bc44b4f4ba9a3` |
| 2 | `f981b91a47ed901e2b02d70b41be9faa8497c805` |
| 3 | `c475b383a5e474f6b176d3f51beff29abd9ce705` |
| 4 | `00f78ee3e5cfb20cdf0324deb69b5b089a3d0e43` |
| 5A | `3f6fb68974e27fa588fd889cb30963c71f50179e` |
| 5B | `a0d4df0f8a3e29e20e139ed48230da21b498332d` |
| 6A | `aeddd091a367813728c74b9920c8428320fb7825` |

Phase 6B.1 and Phase 6B.2A remain uncommitted and documented in their reviewed
reports. No new stash or commit was created in this checkpoint.

## Changed files

Business Core files added:

- `apps/api/app/contracts/catalog_integration_v1.py`
- `apps/api/app/tests/contracts/conftest.py`
- `apps/api/app/tests/contracts/fixtures/catalog_integration_v1.json`
- `apps/api/app/tests/contracts/test_catalog_integration_v1.py`
- `apps/api/scripts/export_catalog_integration_v1.py`
- `docs/contracts/catalog-integration/v1/README.md`
- `docs/contracts/catalog-integration/v1/kalp-alignment-report.md`
- `docs/contracts/catalog-integration/v1/nestcraft-compatibility.json`
- `docs/contracts/catalog-integration/v1/openapi.json`

NestCraft files added:

- `tests/contracts/business-core-catalog-v1-consumer.test.ts`
- `tests/contracts/fixtures/business-core-catalog-v1.json`
- `docs/NESTCRAFT-STABILIZATION-PHASE-6B-2B-2026-07-24.md`

No dependency manifest or lockfile was changed by Phase 6B.2B.

## Contract definition

The versioned contract is:

`urn:kalp:business-core:catalog-integration:1.0.0`

The generated OpenAPI SHA-256 is:

`c3d7d5086c57b734aea1b1f6960eb9d624223b77833abc1adf2b4f6b5ae48722`

The provider specification is generated deterministically from strict Pydantic
models and checked byte-semantically against the committed JSON representation.
All internal OpenAPI references are tested for resolution.

### Identity and tenant scope

The contract defines:

- a dedicated NestCraft Business Core service principal;
- a client-credentials exchange design;
- candidate issuer `urn:kalp:business-core`, pending the platform identity
  decision;
- audience `urn:kalp:business-core-api`;
- required `iss`, `aud`, `sub`, `exp`, `iat`, `jti`, `tenant_id`, and
  `permissions`;
- maximum access-token lifetime of 900 seconds;
- mandatory JWT `alg`, `kid`, and `typ` header fields;
- server-side one-principal-to-one-tenant binding;
- `commerce.catalog.read` for lookup and validation;
- `commerce.catalog.manage` for future administrative mutation;
- separate service and user authorization for future administrative mutation.

No signing key, client credential, token, or production identity was created or
used. The canonical issuer, approved signing algorithm, key-management
provider, service registration, secure credential storage, rotation, and
revocation operations require a separate platform identity decision. The
candidate consumer contract treats an issued service JWT as a bearer token and
never receives the signing key.

### Product, variant, quantity, and money

The strict DTOs establish:

- product and variant lookup envelopes with a sanitized request identifier;
- explicit variant `productId`;
- `draft`, `active`, and `archived` states;
- active-only product sellability;
- active and in-stock variant sellability when a variant is required;
- cart-add integer quantity from 1 through 99;
- validation of resulting cart quantity, not only the increment;
- effective maximum as the lowest of 99, stock, product maximum, and variant
  maximum;
- INR integer paise fields `unitPriceMinor` and optional
  `compareAtPriceMinor`;
- rejection of authoritative float monetary fields.

### Typed errors

All owner-approved codes and statuses are represented and executable.
`SERVICE_UNAVAILABLE` is used with `503` for unavailability and `504` when the
upstream attempt times out, because the approved error vocabulary defines no
separate timeout code while the transport decision requires timeout to map to
`504`.

Every error uses the strict `error.code`, `error.message`,
`error.requestId`, and `error.details` envelope. Extra fields are rejected.

### Transport

The contract pins:

- 5,000 ms total request budget;
- 2,000 ms attempt timeout;
- no more than two attempts for an eligible catalog GET;
- retry eligibility for transport failure, `502`, `503`, `504`, and eligible
  `429`;
- full jitter with 100 ms initial and 500 ms maximum backoff;
- `Retry-After` capped at 1,000 ms and constrained by the total budget;
- no automatic mutation retry without an idempotency contract;
- sanitized `X-Request-ID`;
- safe `503` and `504` mappings without internal details.

These values are contract decisions, not active NestCraft behavior.

## NestCraft compatibility map

Twenty current catalog callers were reconciled:

| Compatibility | Count | Meaning |
| --- | ---: | --- |
| `ADAPTER_REQUIRED` | 5 | Product lookup/list path, query, status, and body translation is required. |
| `OUTSIDE_6B2_LOOKUP_CONTRACT` | 14 | Categories, attributes, and administrative mutations require later versioned contracts. |
| `ADAPTER_AND_ENDPOINT_EXTENSION_REQUIRED` | 1 | The direct-browser variant list has no equivalent v1 list operation. |

For each profile, the machine-readable map records endpoint, HTTP-status, and
body compatibility. Important incompatibilities include:

- current product pagination and filter envelopes differ from v1 cursor
  semantics;
- current callers accept generic or inconsistent errors rather than the typed
  envelope;
- current product bodies are not strict minor-unit DTOs;
- categories and attributes are outside the product/variant lookup scope;
- product/category/attribute mutations require a later dual-authorization and
  idempotency contract;
- three direct-browser legacy reads remain in the admin feature slices;
- the current variant caller lists variants while v1 only looks up a variant
  by identifier.

No caller or route was changed. Local guarded MongoDB catalog compatibility
routes remain unchanged.

## Runtime and data work still required

Business Core runtime implementation must precede NestCraft production
integration, but it cannot begin until the mandatory Kalp alignment blockers
are resolved:

1. Approve the canonical Kalp workload-identity authority and final issuer.
2. Reconcile the error, correlation, pagination, and API lifecycle contract
   with accepted Business Core/platform conventions.
3. Implement and secure the registered service-principal and
   client-credentials exchange only if Business Core is selected as issuer;
   otherwise validate the approved Kalp issuer.
4. Approve the signing algorithm and key-management/rotation mechanism.
5. Enforce issuer, audience, expiry, permission, and server-side tenant binding.
6. Implement the versioned product, variant, and cart-add validation endpoints.
7. Validate and migrate float-backed catalog prices to INR minor units with
   reconciliation and rollback.
8. Add real endpoint-level provider authorization and tenant tests.
9. Implement timeout, retry, correlation, rate-limit, and safe error behavior.
10. Design later category, attribute, mutation, and idempotency contracts.
11. Build a NestCraft same-origin server adapter that deliberately preserves or
   versions existing consumer success responses.

Until those provider conditions pass, NestCraft Phase 6B.2 runtime integration
remains blocked.

## Verification

### Business Core

Environment:

- Python `3.14.0`
- Pydantic `2.13.4`
- pytest `8.4.2`

Results:

- strict provider contract/schema tests: **26 passed**
- existing no-live authz, security-token, and configuration tests:
  **6 passed**
- existing pure commerce model characterization: **1 passed, 1 deselected**
- targeted Python compilation: **passed**
- OpenAPI generation/reproduction: **passed**
- OpenAPI internal-reference validation: **passed**
- `git diff --check`: **passed**
- secret-pattern scan over Phase 6B.2B Business Core files:
  **0 findings**

The existing commerce characterization emitted one Starlette/httpx deprecation
warning; no dependency remediation was performed.

### NestCraft

Environment:

- Node `v22.23.1`
- npm `11.11.1`
- Next.js `15.5.21`
- React `19.2.6`
- React DOM `19.2.6`

Results:

- `npm ci`: **passed**, 579 packages installed
- `npm ls next react react-dom`: **passed**
- `npm run typecheck`: **passed**
- `npm test`: **68/68 passed** in 11 files
  - previous suite: 61 tests
  - new isolated consumer contract suite: 7 tests
- credential-free `npm run build`: **passed**, 16/16 static pages generated
- `npm run scan:secrets`: **passed**, 0 findings
- `git diff --check`: **passed**

`npm ci` continued to report the existing nine audit findings: 1 low,
3 moderate, and 5 high. No audit fix or dependency remediation was attempted.

All application credentials were absent during NestCraft verification.
NestCraft's test network guard remained active. Business Core contract tests
also block socket connection attempts automatically. Provider models,
generation, and selected existing tests used only in-process fixtures and
models. No MongoDB, Business Core server, or other application service was
contacted.

## Deliberately unchanged

- No Business Core runtime route or router registration.
- No token endpoint activation or runtime authentication change.
- No product, variant, category, attribute, cart, price, inventory, checkout,
  order, payment, or tenant behavior change.
- No data or minor-unit migration.
- No local MongoDB route retirement.
- No dependency or audit remediation.
- No Kalp Adapt, SiteBridge, KCP, or baseline change.
- No provisioning work read, executed, modified, staged, or attributed.
- No credential use, creation, rotation, revocation, or history rewrite.
- No commit, push, deployment, or baseline acceptance.

## Next gate

The next bounded checkpoint is the platform workload-identity and API-contract
alignment decision. Business Core runtime implementation must not begin merely
because the isolated schemas pass. NestCraft Phase 6B.2 must wait until the
alignment blockers, provider endpoints, identity enforcement, tenant binding,
minor-unit source data, and executable runtime provider tests all pass.
