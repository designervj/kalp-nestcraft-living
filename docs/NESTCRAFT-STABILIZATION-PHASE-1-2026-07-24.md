# NestCraft stabilization phase 1

Date: 2026-07-24
Scope: npm/Next.js toolchain stabilization and build-environment diagnosis only.
Status: implemented and verified; not committed or pushed.

## Outcome

NestCraft now has one declared package manager, one lockfile, one exact Next.js
version, independent typecheck semantics and a deterministic build ID.

Clean installation and typecheck pass. The production build compiles and
typechecks, then fails during Next.js page-data collection because
`app/api/comments/route.ts` imports a MongoDB module that validates and connects
at module initialization. No environment file, database value, fake database or
production secret was supplied.

No Kalp Adapt file, SiteBridge overlay, Kalp baseline, ecommerce behavior, API,
authentication, pricing, inventory, checkout or publication authority was
changed.

## Git state

### Start

| Field | Value |
| --- | --- |
| Branch | `main` |
| Commit | `0e598e07ca35ec83b581787cf0e74334ccf79e88` |
| Tracking | `origin/main` |
| Worktree | Clean |
| Root lockfiles | `package-lock.json`, `pnpm-lock.yaml` |

The branch `fix/nestcraft-stabilization` was created from this clean state.

### End

| Field | Value |
| --- | --- |
| Branch | `fix/nestcraft-stabilization` |
| Commit | `0e598e07ca35ec83b581787cf0e74334ccf79e88` |
| Worktree | Dirty only with the intentional phase-1 files listed below |
| Commit/push | None |

## Changed files

- `package.json`
- `package-lock.json`
- `pnpm-lock.yaml` — deleted
- `next.config.ts`
- `docs/NESTCRAFT-STABILIZATION-PHASE-1-2026-07-24.md`

`tsconfig.tsbuildinfo` was changed by typecheck and restored to its starting
content; it is not part of the work order.

## Toolchain changes

### `package.json`

```diff
+  "packageManager": "npm@11.11.1",
+  "engines": {
+    "node": ">=22 <23",
+    "npm": ">=11 <12"
+  },
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
-    "lint": "tsc --noEmit"
+    "typecheck": "tsc --noEmit"
   },
...
-    "next": "^15.3.0",
+    "next": "15.5.21",
```

All overlapping `next@...` overrides were removed. The unrelated security
overrides were retained.

### `next.config.ts`

```diff
-  // Tie build ID to deployment timestamp so each deploy gets unique chunk hashes
+  // Deployments can provide a stable revision; local builds remain reproducible.
   generateBuildId: async () => {
-    return `build-${Date.now()}`;
+    return process.env.NEXT_BUILD_ID?.trim() || 'local';
   },
```

`NEXT_BUILD_ID` is optional. Deployment can supply a stable revision; the local
fallback is the deterministic string `local`.

## Versions and lockfile decision

The repository is standardized on npm:

- retained `package-lock.json`, lockfile version `3`;
- deleted `pnpm-lock.yaml`;
- declared Node `>=22 <23`;
- declared npm `>=11 <12`;
- pinned package manager metadata to `npm@11.11.1`;
- pinned Next.js exactly to `15.5.21`.

Resolved dependency versions:

| Package | Version |
| --- | --- |
| Next.js | `15.5.21` |
| React | `19.2.6` |
| React DOM | `19.2.6` |
| TypeScript | `5.9.3` |

`package-lock.json` was updated only through:

```text
npm install --package-lock-only --ignore-scripts
```

It completed with exit code `0`. The lockfile changed from raw SHA-256
`968162555996d0c8a5bccd65249d25d2632bcc62b2129c6af6e9773e97e83d5c`
to `fda96ddd3f1ade2148a3d6608463402bfde9d5f07bc01dac375493df16ee536b`.
The diff contains root metadata, Next `15.5.19 → 15.5.21`, matching SWC
artifacts and npm 11 lock-metadata normalization.

## Verification results

### Host versions

```text
node v25.8.2
npm  11.11.1
```

The host Node version is outside the newly declared Node 22 range. npm emitted
`EBADENGINE` as expected but did not fail because engine-strict is not enabled.
The same commands must be repeated under Node 22 before accepting this branch.

### Clean install

Command:

```text
npm ci
```

Result: exit code `0`; 546 packages installed without `--force` or
`--legacy-peer-deps`.

npm reported:

- one deprecation notice for `node-domexception`;
- 9 audit findings: 1 low, 3 moderate and 5 high;
- no automatic audit fix was run.

### Dependency tree

Command:

```text
npm ls next react react-dom
```

Result: exit code `0`.

- `next@15.5.21`
- `react@19.2.6`
- `react-dom@19.2.6`
- React and React DOM are deduplicated through the reported dependency tree.

### Typecheck

Command:

```text
npm run typecheck
```

Result: exit code `0`; executes `tsc --noEmit`.

No lint result is claimed. This phase deliberately did not install ESLint or
declare a replacement lint command.

### Diff validation

`git diff --check` completed with exit code `0`.

## Redacted environment-variable inventory

No root `.env*` file was present during the inventory or controlled build.
Values were not read, supplied or recorded.

### Active source variables

| Variable | Referencing source paths | Exposure | Requirement/classification | Missing behavior |
| --- | --- | --- | --- | --- |
| `MONGODB_URI` | `lib/db.ts`; `lib/mongodb.ts` | Server only | Secret; runtime required, but incorrectly build-required through module evaluation | Both modules throw at import when absent. `lib/mongodb.ts` also starts `client.connect()` at module scope when present. |
| `JWT_SECRET` | `lib/auth.ts`; `app/api/ecommerce/cart/route.ts` | Server only | Secret; runtime required for authenticated behavior | Cart treats the caller as anonymous when absent. Admin auth uses a weak literal fallback; unchanged in this phase. |
| `DB_NAME` | `app/api/comments/route.ts` | Server only | Non-secret identifier; runtime optional | Falls back to request header, then the literal database name `test`. |
| `NEXT_BUILD_ID` | `next.config.ts` | Build configuration, not browser-exposed by Next's public prefix | Non-secret; build optional | Falls back deterministically to `local`. |
| `NEXT_PUBLIC_API_BASE_URL` | `lib/apiProxy.ts`; `lib/getPageData.ts`; `lib/getSingleUser.ts`; `lib/store/attributes/attributesThunk.ts`; `lib/store/auth/authThunks.ts`; `lib/store/branding/brandingThunks.ts`; `lib/store/categories/categoriesThunk.ts`; `lib/store/comments/commentThunk.ts`; `lib/store/features/adminAttributesSlice.ts`; `lib/store/features/adminCategoriesSlice.ts`; `lib/store/features/adminOrdersSlice.ts`; `lib/store/features/adminTenantsSlice.ts`; `lib/store/features/adminVariantsSlice.ts`; `lib/store/forms/formsThunk.ts`; `lib/store/products/productsThunk.ts`; `lib/store/users/usersThunk.tsx` | Public/browser bundle and server | Non-secret URL; build-embedded and operationally required | Behavior is inconsistent: some calls use localhost fallback, some form invalid `undefined/...` URLs, and some catch fetch failures. |
| `NEXT_PUBLIC_TENANT_ID` | `app/[locale]/about/page.tsx`; `app/[locale]/layout.tsx`; `app/[locale]/login/_components/LoginPageClient.tsx`; `app/[locale]/wishlist/_components/WishlistPageClient.tsx`; `components/auth/LoginFormSection.tsx`; `components/contactpage/contactForm/ContactForm.tsx`; `components/pages/CheckoutPage.tsx`; `lib/apiProxy.ts`; `lib/db.ts`; `lib/getPageData.ts`; `lib/getSingleUser.ts`; `lib/services/orders.ts`; `lib/store/attributes/attributesThunk.ts`; `lib/store/auth/authThunks.ts`; `lib/store/branding/brandingThunks.ts`; `lib/store/businessBlueprints/businessBlueprintsThunk.ts`; `lib/store/cart/cartThunk.ts`; `lib/store/categories/categoriesThunk.ts`; `lib/store/comments/commentThunk.ts`; `lib/store/features/adminAttributesSlice.ts`; `lib/store/features/adminCategoriesSlice.ts`; `lib/store/features/adminOrdersSlice.ts`; `lib/store/features/adminVariantsSlice.ts`; `lib/store/forms/formsThunk.ts`; `lib/store/pages/pageThunk.ts`; `lib/store/products/productsThunk.ts`; `lib/store/users/usersThunk.tsx` | Public/browser bundle and server | Non-secret tenant identifier; build-embedded and operationally required | Missing values become empty/undefined headers in many calls; product fetch has a NestCraft-specific fallback; Mongo tenant DB selection can receive undefined. |
| `NEXT_PUBLIC_TENANT_DB_NAME` | `components/homepage/newsletter/Newsletter.tsx` | Public/browser bundle | Non-secret tenant identifier; build-embedded, feature-required | Newsletter omits the tenant header when absent. |
| `NEXT_PUBLIC_ENVIRONMENT` | `app/[locale]/login/_components/LoginPageClient.tsx`; `components/auth/LoginFormSection.tsx` | Public/browser bundle | Non-secret environment selector; build-embedded, optional in code | Defaults to `prod`, selecting the hard-coded production-style SSO redirect branch. |
| `NODE_ENV` | `app/api/[[...slug]]/route.ts`; `app/api/ecommerce/cart/route.ts`; `components/ui/ErrorFallback.tsx`; `lib/mongodb.ts` | Framework-controlled; client branches may be compiled | Non-secret framework variable; build/runtime supplied by Next.js | Controls secure cookie flags, development error detail and Mongo connection caching. |

### Reference-only variable names

The following names occur in tracked design/pivot documentation but were not
found as active `process.env` reads in application source:

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

Tracked legacy scripts/documents also contain credential-like literals. Their
values are intentionally omitted. This is an urgent secret-rotation and
repository-hygiene risk, but removal/rotation was outside this work order.

## Controlled production build

Command:

```text
npm run build
```

Result: exit code `1`.

Successful phases:

1. optimized production compilation;
2. lint/type validity phase.

First failing phase: `Collecting page data`.

First meaningful error, redacted:

```text
Invalid/Missing environment variable: "MONGODB_URI"
Failed to collect page data for /api/comments
```

### Root import chain

```text
Next.js page-data collection
→ /api/comments compiled route
→ app/api/comments/route.ts
→ import clientPromise from "@/lib/mongodb"
→ lib/mongodb.ts module initialization
→ immediate MONGODB_URI validation
→ throw before GET/POST/PUT/DELETE executes
```

`lib/mongodb.ts` also creates and starts the Mongo client promise at module
scope. Therefore this is not merely a missing deployment value: the route makes
database initialization part of module loading during build analysis.

A second module, `lib/db.ts`, also throws at import when `MONGODB_URI` is
absent. It is statically imported by:

- `app/api/ecommerce/attributes/bulk/route.ts`
- `app/api/ecommerce/attributes/route.ts`
- `app/api/ecommerce/cart/route.ts`
- `app/api/ecommerce/categories/bulk/route.ts`
- `app/api/ecommerce/categories/route.ts`
- `app/api/ecommerce/products/[id]/route.ts`
- `app/api/ecommerce/products/bulk/route.ts`
- `app/api/ecommerce/products/route.ts`
- `lib/getPageData.ts`

The comments route is simply the first observed failure; fixing only that route
may expose the same coupling through these imports.

### Recommended phase-2 options

No option was implemented.

1. Make Mongo configuration validation and connection creation lazy inside a
   request-time connection function; do not throw or call `connect()` at module
   import.
2. Decide whether the local comments/ecommerce Mongo routes are active
   authorities. Remove or isolate unused routes only after the owner decision.
3. Classify affected routes as request-time dynamic where appropriate, while
   recognizing that a dynamic declaration alone may not make unsafe module
   initialization safe.
4. If build-time database access is genuinely required, document that
   architecture and provide credentials only through an approved build-secret
   mechanism. Do not use a fake URI or production credential for calibration.
5. After the coupling fix, run the build again without secrets to reveal the
   next independent failure.

## Risks and phase-2 priority

1. **Credential exposure:** rotate and remove redacted credential-like literals
   found in tracked legacy scripts/docs through a separate security work order.
2. **Build-time database coupling:** address module-scope Mongo validation and
   connection creation before adding test/evidence infrastructure.
3. **Approved runtime proof:** rerun install, dependency tree, typecheck and
   build on Node 22; this host used Node 25.
4. **Dependency audit:** triage the 9 npm audit findings without an automatic
   force upgrade.
5. **Environment contract:** add a value-free `.env.example` only in an
   approved phase after build/runtime/optional classifications are accepted.
6. **Test boundary:** add the minimum server and journey tests only after the
   build-time coupling is understood.

## Scope confirmation

- No secret value or connection string was added, used or reproduced here.
- No production database or fake database was contacted.
- No ecommerce behavior, API contract, authentication, pricing, inventory,
  checkout or publication behavior was repaired.
- No SiteBridge overlay was added.
- No Kalp Adapt file or baseline was modified.
- No waiver, Kalp API, Kalp Intelligence or KCP integration was created.
- No commit or push was performed.
