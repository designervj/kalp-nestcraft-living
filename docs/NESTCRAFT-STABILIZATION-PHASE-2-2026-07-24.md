# NestCraft Stabilization Phase 2

Date: 2026-07-24

Repository: `/Users/apple/Desktop/WORK/GIT/kalp-os/nestcraft-live`

Branch: `fix/nestcraft-stabilization`

Starting commit: `0e598e07ca35ec83b581787cf0e74334ccf79e88`

## Scope and precondition

This work order removes build-time MongoDB initialization only. It does not
change database names, collections, successful route response shapes, API
contracts, ecommerce behavior, authentication, pricing, checkout, Kalp Adapt,
baselines, or SiteBridge.

The starting working tree contained only the expected phase-1 changes:

```text
 M next.config.ts
 M package-lock.json
 M package.json
 D pnpm-lock.yaml
?? docs/NESTCRAFT-STABILIZATION-PHASE-1-2026-07-24.md
```

No unrelated changes were found. No commit or push was performed.

The host did not have `nvm`, so the declared runtime was invoked without
altering repository dependencies:

```text
npm exec --yes --package=node@22.23.1 --package=npm@11.11.1 --call '<command>'
Node: v22.23.1
npm: 11.11.1
```

## Phase-1 verification under Node 22

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 546 packages installed |
| `npm ls next react react-dom` | PASS |
| Installed Next.js | `15.5.21` |
| Installed React | `19.2.6` |
| Installed React DOM | `19.2.6` |
| `npm run typecheck` | PASS |
| `env -u MONGODB_URI npm run build` | EXPECTED FAILURE before phase 2 |
| `git diff --check` | PASS |

The pre-change build failed during `Collecting page data` for
`/api/ecommerce/categories`:

```text
Error: Please define the MONGODB_URI environment variable inside .env
Failed to collect page data for /api/ecommerce/categories
Exit code: 1
```

This is the same shared module-scope coupling reported in phase 1. The route
surfaced first because Next.js collects route data concurrently; it was not a
new independent failure.

## Initialization behavior

### Before

- `lib/mongodb.ts` read and validated `MONGODB_URI` at module scope.
- `lib/mongodb.ts` constructed `MongoClient` and called `connect()` at module
  scope.
- `lib/db.ts` read, transformed, and validated `MONGODB_URI` at module scope.
- Importing either helper, or any route importing it, could fail or initiate a
  database connection during the Next.js build.

### After

- Both helpers read and validate `MONGODB_URI` only inside lazy functions.
- `MongoClient` construction and `connect()` occur only after a handler or
  model function requests a database connection.
- `lib/mongodb.ts` preserves a development global promise and a production
  module-scoped promise. A rejected connection clears the relevant promise so
  a later request may retry.
- `lib/db.ts` preserves its shared cached client/promise behavior and clears a
  rejected promise.
- Existing URI normalization, the `kalp_master` database selection, tenant
  database selection, collection names, and successful API responses remain
  unchanged.
- `app/api/comments/route.ts` now obtains its client inside each existing
  request handler and inside the existing `try`/`catch` boundary.

## Import and route review

Direct import chains reviewed:

```text
app/api/comments/route.ts
  -> lib/mongodb.ts

app/api/ecommerce/attributes/bulk/route.ts
app/api/ecommerce/attributes/route.ts
app/api/ecommerce/cart/route.ts
app/api/ecommerce/categories/bulk/route.ts
app/api/ecommerce/categories/route.ts
app/api/ecommerce/products/[id]/route.ts
app/api/ecommerce/products/bulk/route.ts
app/api/ecommerce/products/route.ts
  -> lib/db.ts directly or through models/index.ts

models/index.ts
  -> lib/db.ts

lib/getPageData.ts
  -> lib/db.ts
  -> locale layout and content/category/product/shop pages
```

The model functions and page-data functions already request a connection only
inside asynchronous functions. They required no product-code change after the
helpers became import-safe.

Standalone scripts under `tmp/` contain explicit MongoDB clients, but they are
not statically imported by the Next.js application and connect only when those
scripts are deliberately executed. They were not changed.

## Side-effect and missing-configuration checks

Import smoke test with `MONGODB_URI` removed:

```text
await import("./lib/db.ts")
await import("./lib/mongodb.ts")
IMPORT_SAFE_WITHOUT_MONGODB_URI
```

An AST scan of `lib/db.ts` and `lib/mongodb.ts` found:

```text
MODULE_SCOPE_MONGO_SIDE_EFFECTS=0
```

All `MONGODB_URI` reads are inside `getMongoUri()`. All `MongoClient`
construction and connection calls are inside `createConnection()` or
`connectClient()`.

A local production server was started with `MONGODB_URI` explicitly removed.
Calling `GET /api/comments` returned:

```text
HTTP 500
{"success":false,"error":"Failed to fetch pages"}
```

The server logged the missing configuration error. The lazy validator rejected
the request before client construction, so no database or network connection
was attempted.

## Changed files

Phase-2 files:

```text
app/api/comments/route.ts
lib/db.ts
lib/mongodb.ts
docs/NESTCRAFT-STABILIZATION-PHASE-2-2026-07-24.md
```

The working tree also retains the approved, uncommitted phase-1 files:

```text
next.config.ts
package.json
package-lock.json
pnpm-lock.yaml (deleted)
docs/NESTCRAFT-STABILIZATION-PHASE-1-2026-07-24.md
```

No other repository was modified.

## Final verification under Node 22

All commands used Node `v22.23.1` and npm `11.11.1`.

| Check | Result |
| --- | --- |
| `npm ci` | PASS |
| `npm ls next react react-dom` | PASS: Next `15.5.21`, React/React DOM `19.2.6` |
| `npm run typecheck` | PASS |
| `env -u MONGODB_URI npm run build` | PASS |
| `git diff --check` | PASS |
| Import smoke test without `MONGODB_URI` | PASS |
| Module-scope Mongo side-effect scan | PASS; zero findings |

The credential-free production build compiled, typechecked, collected page
data, generated all 16 static pages, and completed trace collection. No newly
exposed build blocker was found.

`npm ci` reported nine existing audit findings (one low, three moderate, five
high). Dependency remediation was outside this work order.

## Runtime compatibility risks

- No live database was contacted, so successful connection behavior was not
  integration-tested.
- A database-backed request without `MONGODB_URI` now reaches the existing
  handler error boundary instead of failing during import. Existing handlers
  differ in how much error detail they return; normalizing those contracts was
  intentionally out of scope.
- The existing Atlas direct-host URI transformation remains in both helpers.
  Its operational need and security posture should be reviewed separately.
- Pages using `lib/getPageData.ts` still require a correctly configured
  database when their data functions actually execute at runtime. Only
  import/build coupling was removed.
- Existing standalone database scripts remain capable of connecting when
  explicitly run.

## Recommended phase 3

1. Establish and document a value-free environment contract, separating build,
   runtime, optional, public, and secret variables.
2. Add the smallest test infrastructure for lazy database configuration,
   server-side price/cart calculations, checkout validation, and
   authentication secret handling.
3. Address tracked credential-like literals and secret fallback behavior in a
   separately approved security work order, including rotation outside this
   repository where necessary.
4. Review dependency audit findings without broad dependency upgrades.

Do not add the SiteBridge overlay or accept a calibrated baseline until these
verification boundaries are explicit.

## Confirmation

- No secret or connection string was supplied, reproduced, or changed.
- No database was contacted.
- No database name, collection, route payload, successful response shape, or
  API contract was changed.
- No ecommerce, pricing, authentication, checkout, or publication behavior was
  intentionally changed.
- No Kalp Adapt file or baseline was changed.
- No SiteBridge overlay was added.
- No commit or push was performed.
