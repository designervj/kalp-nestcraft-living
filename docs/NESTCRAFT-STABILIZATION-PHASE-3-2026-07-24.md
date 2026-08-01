# NestCraft stabilization phase 3

Date: 2026-07-24

Repository: `/Users/apple/Desktop/WORK/GIT/kalp-os/nestcraft-live`

Branch: `fix/nestcraft-stabilization`

Starting and ending commit:
`0e598e07ca35ec83b581787cf0e74334ccf79e88`

## Outcome

NestCraft now has a value-free `.env.example` and a repository-grounded
environment contract covering every active `process.env` name.

No application configuration is required to compile the current repository.
With all repository integration configuration absent, Node 22 installation,
dependency-tree validation, typecheck, and the production build pass.

This work order changes documentation and example configuration only. It does
not change runtime validation, fallbacks, tenant selection, database behavior,
authentication, API contracts, ecommerce behavior, or deployment.

## Preconditions and checkpoints

The starting working tree contained only the reviewed phase-1 and phase-2
changes. Their focused diffs and reports were re-read, `git diff --check`
passed, and no unrelated changes were found.

The phases remain uncommitted. They were preserved as two separate, named Git
stash checkpoints and immediately reapplied:

| Phase | Recoverable checkpoint |
| --- | --- |
| Phase 1 | `1389df05e8bc288c9ef2ae03a96bc44b4f4ba9a3` |
| Phase 2 | `f981b91a47ed901e2b02d70b41be9faa8497c805` |

Current references:

```text
stash@{1} checkpoint: NestCraft stabilization phase 1 (2026-07-24)
stash@{0} checkpoint: NestCraft stabilization phase 2 (2026-07-24)
```

The working tree was restored after each checkpoint. No commit or push was
performed.

## Runtime and dependency versions

The host lacks `nvm`, so verification used an isolated declared toolchain:

```text
Node v22.23.1
npm 11.11.1
Next.js 15.5.21
React 19.2.6
React DOM 19.2.6
```

## Phase-3 files

- `.env.example`
- `docs/NESTCRAFT-ENVIRONMENT-CONTRACT-2026-07-24.md`
- `docs/NESTCRAFT-STABILIZATION-PHASE-3-2026-07-24.md`

## Complete working-tree file list

The phase-3 files coexist with the restored, uncommitted phase-1 and phase-2
work:

```text
 M app/api/comments/route.ts
 M lib/db.ts
 M lib/mongodb.ts
 M next.config.ts
 M package-lock.json
 M package.json
 D pnpm-lock.yaml
?? .env.example
?? docs/NESTCRAFT-ENVIRONMENT-CONTRACT-2026-07-24.md
?? docs/NESTCRAFT-STABILIZATION-PHASE-1-2026-07-24.md
?? docs/NESTCRAFT-STABILIZATION-PHASE-2-2026-07-24.md
?? docs/NESTCRAFT-STABILIZATION-PHASE-3-2026-07-24.md
```

## `.env.example`

```dotenv
# Server-only runtime configuration
MONGODB_URI=
JWT_SECRET=
DB_NAME=

# Optional deterministic deployment revision
NEXT_BUILD_ID=

# Browser-exposed configuration
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_TENANT_ID=
NEXT_PUBLIC_TENANT_DB_NAME=
NEXT_PUBLIC_ENVIRONMENT=
```

`NODE_ENV` is intentionally excluded because Next.js/npm controls it.

The example contains only empty assignments. It has no hostname, connection
string, token, password, key, credential, or production identifier, and it is
not excluded by `.gitignore`.

## Complete redacted environment inventory

The full contract, including every exact consumer path, missing-value behavior,
fallback, authority, ambiguity, and safe setup guidance, is:

`docs/NESTCRAFT-ENVIRONMENT-CONTRACT-2026-07-24.md`

Summary:

| Variable | Class | Visibility | Sensitivity | Current missing behavior |
| --- | --- | --- | --- | --- |
| `MONGODB_URI` | `RUNTIME_REQUIRED` | `SERVER_ONLY` | `SECRET` | Lazy request-time configuration failure |
| `JWT_SECRET` | `RUNTIME_REQUIRED` | `SERVER_ONLY` | `SECRET` | Cart becomes anonymous; auth helper uses a literal fallback |
| `DB_NAME` | `OPTIONAL` | `SERVER_ONLY` | `NON_SECRET` | Request header, then generic database fallback |
| `NEXT_BUILD_ID` | `TOOLING` | `SERVER_ONLY` | `NON_SECRET` | Deterministic `local` fallback |
| `NEXT_PUBLIC_API_BASE_URL` | `RUNTIME_REQUIRED` | `BROWSER_EXPOSED` | `NON_SECRET` | Mixed development fallback, invalid URL, or caught fetch failure |
| `NEXT_PUBLIC_TENANT_ID` | `RUNTIME_REQUIRED` | `BROWSER_EXPOSED` | `NON_SECRET` | Mixed undefined header, hard-coded tenant fallback, or ambiguous DB selection |
| `NEXT_PUBLIC_TENANT_DB_NAME` | `OPTIONAL` | `BROWSER_EXPOSED` | `NON_SECRET` | Newsletter tenant header omitted |
| `NEXT_PUBLIC_ENVIRONMENT` | `OPTIONAL` | `BROWSER_EXPOSED` | `NON_SECRET` | Existing production-mode branch selected |
| `NODE_ENV` | `TOOLING` | `BROWSER_EXPOSED` | `NON_SECRET` | Next.js/npm normally supplies it |

Static analysis found 64 direct accesses across these nine unique names. It
found no environment access through destructuring, aliases, element access,
`import.meta.env`, `Deno.env`, or another active wrapper.

## Coverage checks

Machine comparison of application/configuration source to the contract:

```text
Active environment names: 9
Contract variable sections: 9
Undocumented active names: none
Stale contract entries: none
Missing .env.example entries: none
Extra .env.example entries: none
.env.example credential scan: pass
```

The scan covered application code, configuration, root scripts, middleware,
temporary scripts, and executable repository files. Package scripts and
deployment/CI boundaries were inspected separately.

## Unused and ambiguous variables

Names present in tracked design/reference documents but unused by current
application/tooling code:

- `BACKEND_API_URL`
- `KALZERO_PUBLIC_API_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_TAX_RATE`
- `NEXT_PUBLIC_TENANT_DB`

They were excluded from `.env.example` to avoid claiming active support.

Active but ambiguous:

- authority for `DB_NAME`;
- purpose and authority of `NEXT_PUBLIC_TENANT_DB_NAME`;
- valid values and owner for `NEXT_PUBLIC_ENVIRONMENT`;
- endpoint and tenant authority split between public variables, hard-coded
  destinations, and server proxies;
- deployment and publication configuration, because no executable deployment
  definition exists.

## `NEXT_PUBLIC_*` findings

- `NEXT_PUBLIC_API_BASE_URL` is used by browser requests, but endpoint authority
  is mixed across direct calls, proxy code, and hard-coded fallbacks.
- `NEXT_PUBLIC_TENANT_ID` is legitimately consumed by browser flows, but it is
  also used for server-side MongoDB database selection. Public identification
  must not be treated as tenant authorization.
- `NEXT_PUBLIC_TENANT_DB_NAME` exposes a database-oriented name for newsletter
  behavior; necessity is unresolved.
- `NEXT_PUBLIC_ENVIRONMENT` is a public authentication routing selector and
  defaults to the existing production branch.

## Redacted secret and literal findings

No value was printed, copied, or added.

Active secret fallback:

- `lib/auth.ts`: hard-coded `JWT_SECRET` fallback, value redacted.

Credential-bearing MongoDB URI literals:

- `check_users.js`
- `create_contact_page.js`
- `list_pages.js`
- `tmp/check_count.js`
- `tmp/check_full_doc.js`
- `tmp/check_schema.js`
- `tmp/import_products.js`
- `tmp/import_products_fixed.js`
- `tmp/list_dbs.js`
- `tmp/seed_categories.js`
- `ecomV2_updated.md`

Infrastructure/scheme literals without a credential classification:

- `lib/db.ts`
- `lib/mongodb.ts`
- `ecomV2.md`

The Mongo helpers also contain duplicated hard-coded Atlas host transformation
details. Authentication/API modules contain hard-coded service destinations.
These findings were recorded, not repaired.

## Tenant and database-selection risks

1. The comments API accepts request-controlled `x-tenant-db` selection when
   `DB_NAME` is absent.
2. It uses a generic database fallback if neither source exists.
3. `lib/db.ts` uses browser-exposed `NEXT_PUBLIC_TENANT_ID` for server-side
   database selection.
4. Tenant fallback behavior differs across page-data and browser request code.
5. `NEXT_PUBLIC_TENANT_DB_NAME` is a second, unresolved tenant/database name.

No selection behavior or fallback was changed.

## Integration and deployment inspection

- Root package scripts: `dev`, `build`, `start`, `typecheck`; none inject
  configuration.
- No Docker, Compose, Vercel, Netlify, Railway, Fly, Kubernetes, GitHub
  Actions, GitLab CI, or Jenkins definition was found.
- No active environment variables were found for analytics, payment gateways,
  email/SMTP, object storage, or publication.
- Analytics, payment, newsletter, contact, and upload code exists, so missing
  configuration authority remains a documentation/architecture concern rather
  than proof that those integrations are operational.

## Verification

Commands ran with a scrubbed process environment under Node `v22.23.1` and npm
`11.11.1`.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 546 packages installed |
| `npm ls next react react-dom` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; all 16 static pages generated |
| `git diff --check` | PASS |
| Environment-name contract coverage | PASS |
| Undocumented/stale entry check | PASS |
| `.env.example` credential-like value scan | PASS |

`npm ci` reported the existing nine audit findings: one low, three moderate,
and five high. No audit fix or dependency change was performed.

No MongoDB, Business Core, authentication, analytics, payment, email, storage,
or other application integration was contacted. The required package
installation is a tooling operation and may use npm's package cache or package
registry; it is not an application runtime integration.

## Diff statistics

Tracked phase-1 and phase-2 diff:

```text
7 files changed, 228 insertions(+), 6410 deletions(-)
```

The three phase reports, environment contract, and `.env.example` are currently
untracked and therefore are not included in ordinary `git diff --stat`.

## Recommended phase-4 test scope

Introduce the minimum test infrastructure in this order:

1. Import-safety and missing-configuration tests for `lib/db.ts` and
   `lib/mongodb.ts`, with Mongo clients stubbed so network access is impossible.
2. Request-level verification that missing Mongo configuration reaches
   controlled handler error boundaries without changing response contracts.
3. Authentication tests that expose the current missing-secret and fallback
   behavior before any security repair.
4. Server-authoritative price and total calculation tests.
5. Cart quantity, merge, persistence, and total tests.
6. Checkout request validation and client-price tampering tests.
7. Tenant/database-selection boundary tests, including the comments header and
   public tenant identifier.

Security repairs, credential rotation, and product behavior changes should
remain separate reviewed work orders after the tests establish current
behavior.

## Confirmation

- No secret value was supplied, revealed, rotated, reproduced, or added.
- No application external service or database was contacted.
- No API contract, database selection, tenant behavior, authentication,
  ecommerce, pricing, inventory, checkout, or product behavior was changed.
- No runtime validation or fallback was added, removed, or renamed.
- No test dependency or framework was added.
- No Kalp Adapt file or baseline was modified.
- No SiteBridge overlay was added.
- No deployment was changed.
- No commit or push was performed.
