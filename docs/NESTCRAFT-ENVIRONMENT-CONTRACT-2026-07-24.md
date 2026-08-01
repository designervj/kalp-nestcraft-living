# NestCraft environment contract

Date: 2026-07-24

Repository: `/Users/apple/Desktop/WORK/GIT/kalp-os/nestcraft-live`

Branch: `fix/nestcraft-stabilization`

Status: phase-3 value-free contract; no runtime behavior changes

## Purpose and rules

This document records current repository behavior. It is not a statement that
the behavior is secure or architecturally final.

- `.env.example` contains no operational values.
- `NEXT_PUBLIC_*` values are browser-readable and may be embedded into client
  bundles during `next build`. They must never contain secrets.
- `NODE_ENV` is controlled by Next.js/npm and is intentionally omitted from
  `.env.example`.
- An empty example assignment means that the operator must either supply an
  approved value through the deployment configuration authority or accept the
  documented missing-value behavior.
- No variable is renamed and no new validation or fallback is introduced by
  this work order.

## Classification summary

No application variable is required merely to compile the current repository.
The credential-free production build passes. `BUILD_REQUIRED` is therefore
unused in the current contract.

| Variable | Classification | Visibility | Sensitivity | Configuration authority |
| --- | --- | --- | --- | --- |
| `MONGODB_URI` | `RUNTIME_REQUIRED` | `SERVER_ONLY` | `SECRET` | Deployment secret manager and MongoDB service owner |
| `JWT_SECRET` | `RUNTIME_REQUIRED` | `SERVER_ONLY` | `SECRET` | Authentication/session owner and deployment secret manager |
| `DB_NAME` | `RUNTIME_REQUIRED` | `SERVER_ONLY` | `CONFIDENTIAL` | NestCraft deployment owner; sole local database authority |
| `NEXT_BUILD_ID` | `TOOLING` | `SERVER_ONLY` | `NON_SECRET` | Deployment/release pipeline |
| `NEXT_PUBLIC_API_BASE_URL` | `RUNTIME_REQUIRED` | `BROWSER_EXPOSED` | `NON_SECRET` | Business Core/API deployment owner |
| `NEXT_PUBLIC_TENANT_ID` | `RUNTIME_REQUIRED` | `BROWSER_EXPOSED` | `NON_SECRET` | Tenant registry/Business Core owner and deployment configuration |
| `NEXT_PUBLIC_TENANT_DB_NAME` | `OPTIONAL` | `BROWSER_EXPOSED` | `NON_SECRET` | Newsletter integration owner; authority unresolved |
| `NEXT_PUBLIC_ENVIRONMENT` | `OPTIONAL` | `BROWSER_EXPOSED` | `NON_SECRET` | Authentication/SSO deployment owner |
| `NODE_ENV` | `TOOLING` | `BROWSER_EXPOSED` | `NON_SECRET` | Next.js/npm |

`BROWSER_EXPOSED` for `NODE_ENV` means that Next.js can compile its known value
into client code; it is not an operator-defined public variable.

## Variable contracts

### `MONGODB_URI`

- Classification: `RUNTIME_REQUIRED`
- Visibility: `SERVER_ONLY`
- Sensitivity: `SECRET`
- Consumers:
  - `lib/db.ts`
  - `lib/mongodb.ts`
- Missing-value behavior: imports and builds remain safe. The first
  database-backed request or data function that asks for a client throws a
  configuration error before client construction or network access. Existing
  route error boundaries convert this to their current server-error response.
- Current default/fallback: none. Both helpers contain an existing,
  infrastructure-specific URI-host rewrite; host values are omitted here.
- Configuration authority: deployment secret manager, approved by the MongoDB
  service owner.
- Risk/ambiguity: the two helpers duplicate hard-coded Atlas infrastructure
  knowledge. Successful live connection behavior has not been tested. Some
  handler error responses reveal more configuration detail than others.
- Safe setup: provide only through an approved server-side secret store. Never
  use `NEXT_PUBLIC_*`, source control, build logs, or `.env.example`.

### `JWT_SECRET`

- Classification: `RUNTIME_REQUIRED`
- Visibility: `SERVER_ONLY`
- Sensitivity: `SECRET`
- Consumers:
  - `lib/auth-secret.ts`
  - `lib/auth.ts`
  - `app/api/ecommerce/cart/route.ts`
- Missing-value behavior: missing and blank values fail closed before JWT
  verification. Authentication returns no authenticated identity. The cart
  continues through its existing anonymous-session path.
- Current default/fallback: none.
- Configuration authority: authentication/session owner and deployment secret
  manager.
- Risk/ambiguity: client-visible behavior intentionally does not disclose
  whether authentication failed because configuration or a token was invalid.
  Operational monitoring for missing configuration remains to be defined.
- Safe setup: provide a high-entropy value through a server-side secret store.
  Never expose it through a `NEXT_PUBLIC_*` variable, fixture, snapshot, or
  source file.

### `DB_NAME`

- Classification: `RUNTIME_REQUIRED`
- Visibility: `SERVER_ONLY`
- Sensitivity: `CONFIDENTIAL`
- Consumers:
  - `app/api/comments/route.ts`
  - `lib/apiProxy.ts`
  - `lib/database-authority.ts`
  - `lib/db.ts`
- Missing-value behavior: missing, blank, or invalid configuration fails closed
  before Mongo client creation, collection access, or proxy network access.
- Current default/fallback: none.
- Configuration authority: the NestCraft deployment owner. Each application
  instance serves exactly one website/business database.
- Validation: 1–63 ASCII letters, digits, underscores, or hyphens, beginning
  with a letter or digit.
- Risk/ambiguity: the database identifier is operationally confidential even
  though it is not a credential. It must not be returned to clients, logged, or
  included in browser configuration.
- Safe setup: provide the deployment-approved database identifier through
  server-only runtime configuration. Never use a `NEXT_PUBLIC_*` value or a
  request field as a substitute.

### `NEXT_BUILD_ID`

- Classification: `TOOLING`
- Visibility: `SERVER_ONLY`
- Sensitivity: `NON_SECRET`
- Consumer:
  - `next.config.ts`
- Missing-value behavior: the build uses the deterministic local fallback
  `local`.
- Current default/fallback: `local`.
- Configuration authority: deployment/release pipeline.
- Risk/ambiguity: multiple deployments that omit the value share the same build
  identifier.
- Safe setup: deployment may supply a stable, non-secret revision identifier.
  Do not put credentials or user data in it.

### `NEXT_PUBLIC_API_BASE_URL`

- Classification: `RUNTIME_REQUIRED`
- Visibility: `BROWSER_EXPOSED`
- Sensitivity: `NON_SECRET`
- Consumers:
  - `lib/apiProxy.ts`
  - `lib/getPageData.ts`
  - `lib/getSingleUser.ts`
  - `lib/store/attributes/attributesThunk.ts`
  - `lib/store/auth/authThunks.ts`
  - `lib/store/branding/brandingThunks.ts`
  - `lib/store/categories/categoriesThunk.ts`
  - `lib/store/comments/commentThunk.ts`
  - `lib/store/features/adminAttributesSlice.ts`
  - `lib/store/features/adminCategoriesSlice.ts`
  - `lib/store/features/adminOrdersSlice.ts`
  - `lib/store/features/adminTenantsSlice.ts`
  - `lib/store/features/adminVariantsSlice.ts`
  - `lib/store/forms/formsThunk.ts`
  - `lib/store/products/productsThunk.ts`
  - `lib/store/users/usersThunk.tsx`
- Missing-value behavior: inconsistent. One proxy and one product-data path use
  hard-coded development endpoint fallbacks; other consumers construct
  unusable URLs containing an absent base or catch the resulting fetch
  failure. The credential-free build still succeeds.
- Current default/fallback: hard-coded development URLs in selected consumers;
  values are omitted.
- Configuration authority: Business Core/API deployment owner, surfaced to the
  NestCraft deployment.
- Risk/ambiguity: browser exposure is justified for direct client-side API
  calls, but the mixed proxy/direct-call architecture and inconsistent
  fallbacks obscure the authoritative endpoint.
- Safe setup: provide the approved public API origin only. It must not contain
  embedded credentials, tokens, private network credentials, or secret query
  parameters.

### `NEXT_PUBLIC_TENANT_ID`

- Classification: `RUNTIME_REQUIRED`
- Visibility: `BROWSER_EXPOSED`
- Sensitivity: `NON_SECRET`
- Consumers:
  - `app/[locale]/about/page.tsx`
  - `app/[locale]/layout.tsx`
  - `app/[locale]/login/_components/LoginPageClient.tsx`
  - `app/[locale]/wishlist/_components/WishlistPageClient.tsx`
  - `components/auth/LoginFormSection.tsx`
  - `components/contactpage/contactForm/ContactForm.tsx`
  - `components/pages/CheckoutPage.tsx`
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
- Missing-value behavior: inconsistent presentation/context behavior. Some
  requests omit or send an undefined tenant header; some call sites assert that
  the value exists without runtime validation; selected page-data paths use a
  hard-coded tenant fallback.
- Current default/fallback: selected page-data functions use a hard-coded
  tenant identifier; its value is intentionally omitted. Most consumers have
  no fallback.
- Configuration authority: tenant presentation/context owned by the tenant
  registry/Business Core owner and deployment configuration.
- Risk/ambiguity: browser requests still send this value as legacy context.
  Local database routes ignore it, and the server proxy overwrites any database
  header with validated `DB_NAME`. It has no authorization authority.
- Safe setup: provide only the approved public tenant identifier. Never encode
  secrets, credentials, or a confidential database identifier.

### `NEXT_PUBLIC_TENANT_DB_NAME`

- Classification: `OPTIONAL`
- Visibility: `BROWSER_EXPOSED`
- Sensitivity: `NON_SECRET`
- Consumer:
  - `components/homepage/newsletter/Newsletter.tsx`
- Missing-value behavior: the newsletter request omits its tenant header.
- Current default/fallback: none.
- Configuration authority: unresolved; this appears to be a newsletter-specific
  legacy name separate from `NEXT_PUBLIC_TENANT_ID`.
- Risk/ambiguity: its relationship to the canonical presentation identifier is
  undocumented. The name is deprecated as a database selector: same-origin
  proxy requests ignore it and overwrite the outgoing database header from
  server-only `DB_NAME`.
- Safe setup: leave empty until the newsletter integration owner confirms its
  purpose. If used, provide only a non-secret public identifier.

### `NEXT_PUBLIC_ENVIRONMENT`

- Classification: `OPTIONAL`
- Visibility: `BROWSER_EXPOSED`
- Sensitivity: `NON_SECRET`
- Consumers:
  - `app/[locale]/login/_components/LoginPageClient.tsx`
  - `components/auth/LoginFormSection.tsx`
- Missing-value behavior: both login implementations select their existing
  production-mode branch.
- Current default/fallback: `prod`.
- Configuration authority: authentication/SSO deployment owner.
- Risk/ambiguity: the value controls selection between hard-coded SSO
  destinations, while the valid value set and ownership are not centrally
  defined.
- Safe setup: use only the environment selector approved by the authentication
  owner. Treat every value as publicly observable.

### `NODE_ENV`

- Classification: `TOOLING`
- Visibility: `BROWSER_EXPOSED`
- Sensitivity: `NON_SECRET`
- Consumers:
  - `app/api/[[...slug]]/route.ts`
  - `app/api/ecommerce/cart/route.ts`
  - `components/ui/ErrorFallback.tsx`
  - `lib/mongodb.ts`
- Missing-value behavior: outside Next.js tooling, equality checks do not match
  development or production. This affects error detail, cookie security flags,
  and Mongo connection-cache selection.
- Current default/fallback: none in application code; Next.js/npm supplies it
  for standard commands.
- Configuration authority: Next.js/npm.
- Risk/ambiguity: manually setting a nonstandard value can alter security and
  diagnostics behavior.
- Safe setup: do not add it to `.env.example` and do not override the value
  supplied by the standard npm/Next.js command.

## Module-scope access review

Module-scope reads that do not themselves validate configuration, connect to a
service, or perform network work:

- `DB_NAME` in `app/api/comments/route.ts`
- `NEXT_PUBLIC_TENANT_DB_NAME` in
  `components/homepage/newsletter/Newsletter.tsx`
- `NEXT_PUBLIC_TENANT_ID` in `components/pages/CheckoutPage.tsx`,
  `lib/apiProxy.ts`, `lib/services/orders.ts`, and the listed Redux modules
- `NEXT_PUBLIC_API_BASE_URL` in `lib/apiProxy.ts` and the listed Redux modules

Function-, render-, or configuration-callback reads:

- `MONGODB_URI` is read and validated only inside request-time lazy helpers.
- `JWT_SECRET` is read and validated only when token verification is requested.
- `NEXT_BUILD_ID` is read inside `generateBuildId`.
- `NEXT_PUBLIC_ENVIRONMENT` is read during login interaction/render logic.
- Remaining tenant/API reads occur inside data functions or components.
- `NODE_ENV` is read inside route, render, cookie, or connection-selection
  logic.

No environment read currently opens a database or external connection at
module import. Several module-scope constants freeze the build-time
`NEXT_PUBLIC_*` value into client modules; that is expected Next.js behavior,
not proof that the exposure is necessary or authorized.

## Public exposure findings

- All four `NEXT_PUBLIC_*` names are eligible for browser bundling.
- `NEXT_PUBLIC_API_BASE_URL` exposure is functionally justified by current
  direct browser requests, but the endpoint authority is mixed with server
  proxy code.
- `NEXT_PUBLIC_TENANT_ID` remains presentation/context only. It no longer
  selects a local database or supplies proxy database authority.
- `NEXT_PUBLIC_TENANT_DB_NAME` remains a legacy browser value for one
  newsletter request. The server proxy ignores it as authority and overwrites
  the outgoing database header.
- `NEXT_PUBLIC_ENVIRONMENT` is safe to expose as a non-secret selector, but it
  chooses between hard-coded authentication destinations.

## Redacted secret and credential findings

Values were neither printed nor copied.

### Secret fallback containment

| Finding | Path | Current state |
| --- | --- | --- |
| Hard-coded `JWT_SECRET` fallback | `lib/auth.ts` | Removed from the current tree in Phase 5A; no fallback remains |

### Credential-bearing MongoDB URI containment

The Phase-4 scan classified credential-bearing connection strings at:

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

The executable scripts now read `MONGODB_URI` at execution time and fail before
client construction when it is missing. The documentation assignments are
empty and direct readers to server-only environment configuration. This is
current-tree containment only; it does not rewrite Git history or prove
external credential rotation.

### Infrastructure literals

- `lib/db.ts` and `lib/mongodb.ts` contain duplicated, hard-coded MongoDB/Atlas
  host transformation details.
- `ecomV2.md` contains a MongoDB scheme/infrastructure example.
- Authentication and API modules contain hard-coded service destinations.

These are not classified as passwords by this scan, but they disclose or
couple infrastructure and require later ownership review.

## Tenant and database-selection authority

Phase 5B establishes `SINGLE_TENANT_SERVER_CONFIGURED`:

1. `DB_NAME` is the sole local and proxied database authority.
2. Local routes ignore incoming `x-tenant-db`.
3. The server proxy overwrites incoming `x-tenant-db` with validated
   server-only configuration.
4. `NEXT_PUBLIC_TENANT_ID` and `NEXT_PUBLIC_TENANT_DB_NAME` remain public
   presentation/context values only.
5. Missing, blank, or invalid `DB_NAME` fails closed before database or network
   access.

Shared-instance multi-tenancy is explicitly deferred to a separately designed
identity, claim, and mapping migration.

## Integrations and deployment boundary

- No Docker, Compose, Vercel, Netlify, Railway, Fly, Kubernetes, GitHub Actions,
  GitLab CI, or Jenkins configuration was found.
- The root package scripts are `dev`, `build`, `start`, and `typecheck`; none
  inject environment variables.
- Business Core/API configuration is represented by
  `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_TENANT_ID`.
- Authentication/SSO uses `JWT_SECRET`, `NEXT_PUBLIC_ENVIRONMENT`, and
  `NEXT_PUBLIC_TENANT_ID`, plus hard-coded destinations.
- Analytics code exists at `components/AnalyticsInjector.tsx`, but no active
  analytics environment variable was found.
- Payment gateway code exists under `lib/paymentgateway/`, but no active
  payment environment variable was found.
- Newsletter/contact/upload code exists, but no active email, SMTP, object
  storage, or upload-provider environment variable was found.
- No deployment or publication authority is declared in executable
  configuration. It remains unknown.

## Undocumented, unused, and ambiguous names

After this contract, every active `process.env` name is documented.

Names mentioned in tracked design/reference documents but not read by current
application or tooling code:

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

They are not included in `.env.example` because doing so would imply active
support. The reference documents may describe proposals, prior designs, or
stale configuration.

Active names with unresolved presentation or integration semantics:

- `NEXT_PUBLIC_TENANT_DB_NAME`
- `NEXT_PUBLIC_ENVIRONMENT`
- the division of authority between `NEXT_PUBLIC_API_BASE_URL`,
  `NEXT_PUBLIC_TENANT_ID`, and hard-coded service destinations

## Value-free setup

Copy `.env.example` only as a local starting point. Keep secret assignments
outside source control. Supply public values only after their owners confirm
the endpoint, tenant, and environment authority. An empty assignment must not
be interpreted as a valid production value.

## Phase-3 verification

Verification is performed under Node 22 with a scrubbed process environment so
no repository integration credential is available. Results and final Git state
are recorded in the phase-3 report.
