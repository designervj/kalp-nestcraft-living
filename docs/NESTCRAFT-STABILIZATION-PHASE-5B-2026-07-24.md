# NestCraft Stabilization Phase 5B — Tenant Isolation

Date: 2026-07-24
Repository: `/Users/apple/Desktop/WORK/GIT/kalp-os/nestcraft-live`
Branch: `fix/nestcraft-stabilization`
HEAD: `0e598e07ca35ec83b581787cf0e74334ccf79e88`
Outcome: `PASS_WITH_EXTERNAL_SECURITY_BLOCK`

## Outcome

The owner-approved authority model is implemented:

`SINGLE_TENANT_SERVER_CONFIGURED`

Each NestCraft deployment serves one website/business database. `DB_NAME` is
the sole server-side authority for application database selection.
Request-controlled `x-tenant-db`, `NEXT_PUBLIC_TENANT_ID`, and
`NEXT_PUBLIC_TENANT_DB_NAME` cannot select or alter the local or proxied
database.

Phase 5B implementation and verification pass. The branch remains externally
security-blocked because credential rotation/revocation is still
`NOT CONFIRMED`.

## Starting Git state and recoverability

- Branch: `fix/nestcraft-stabilization`
- HEAD: `0e598e07ca35ec83b581787cf0e74334ccf79e88`
- No unrelated working-tree changes were found.
- Phase 1 checkpoint: `1389df05e8bc288c9ef2ae03a96bc44b4f4ba9a3`
- Phase 2 checkpoint: `f981b91a47ed901e2b02d70b41be9faa8497c805`
- Phase 3 checkpoint: `c475b383a5e474f6b176d3f51beff29abd9ce705`
- Phase 4 checkpoint: `00f78ee3e5cfb20cdf0324deb69b5b089a3d0e43`
- Phase 5A checkpoint: `3f6fb68974e27fa588fd889cb30963c71f50179e`
- Mechanism: separate recoverable Git stash objects, reapplied to the working
  tree. No stabilization phase is committed or pushed.

The prior authority-blocked report is preserved as the decision-point record:
`docs/NESTCRAFT-STABILIZATION-PHASE-5B-AUTHORITY-BLOCKED-2026-07-24.md`.

Ending Git state:

- Branch and HEAD are unchanged.
- The working tree contains the reviewed Phase 1–5A files, the Phase-5B files
  listed below, and generated `tsconfig.tsbuildinfo`.
- No unrelated file appeared during implementation or verification.
- No file is staged, committed, or pushed.

## Rotation/revocation status

`NOT CONFIRMED`

The owner confirmed only that rotation/revocation is being handled outside
these work orders. Completion has not been explicitly confirmed. Current-tree
containment, test success, and beginning or completing Phase 5B do not prove
revocation or historical Git cleanup.

No credential value was printed, copied, validated, used, removed, rotated, or
tested.

## Authority implementation

### Central boundary

`lib/database-authority.ts` now:

- reads only server-side `DB_NAME`;
- trims and validates it at request/runtime use;
- accepts 1–63 ASCII letters, digits, underscores, or hyphens, beginning with
  a letter or digit;
- has no default or fallback;
- throws a value-free configuration error for missing, blank, or invalid
  configuration;
- never includes the environment name or configured value in the error.

### Local Mongo access

`lib/db.ts` validates `DB_NAME` before invoking the Mongo client provider.
Both existing local database helpers select the same deployment database.
Consequently, every route using `connectTenantDB()` or a model from
`models/index.ts` inherits the authority boundary.

`app/api/comments/route.ts` now resolves `DB_NAME` before `getMongoClient()`.
It never reads `x-tenant-db` and no longer has a database fallback.

### Server proxy

`lib/apiProxy.ts`:

- does not forward caller-provided `x-tenant-db`;
- does not use a `NEXT_PUBLIC_*` value for database authority;
- validates `DB_NAME` before request-body processing or `fetch`;
- sets the outgoing `x-tenant-db` header unconditionally from server
  configuration;
- returns a generic 500 configuration response before network access when
  authority is unavailable.

The obsolete commented proxy implementation that documented insecure
client-header fallback was removed.

## Before and after flow

Before:

```text
comments: caller x-tenant-db -> DB_NAME -> generic fallback -> database
shared local: NEXT_PUBLIC_TENANT_ID -> database
proxy: caller x-tenant-db -> NEXT_PUBLIC_TENANT_ID fallback -> downstream
```

After:

```text
validated server-only DB_NAME
    ├── local DB helper -> Mongo client -> configured database
    ├── comments route -> Mongo client -> configured database
    └── proxy -> overwrite x-tenant-db -> mocked/real downstream boundary

missing / blank / invalid DB_NAME -> fail closed before Mongo client or fetch
```

## Affected-route inventory

All successful response shapes and collection names are preserved.

| Route | Methods | Authentication | Database authority after Phase 5B |
| --- | --- | --- | --- |
| `app/api/comments/route.ts` | GET, POST, PUT, DELETE | None | Validated `DB_NAME`; caller header ignored |
| `app/api/contact/route.ts` | GET, POST | None | Shared local boundary |
| `app/api/ecommerce/attributes/bulk/route.ts` | POST | Admin cookie before DB | Shared local boundary |
| `app/api/ecommerce/attributes/route.ts` | GET, POST, PUT, DELETE | None | Shared local boundary |
| `app/api/ecommerce/cart/route.ts` | GET, POST, PUT, DELETE | Guest or optional user session | Shared local boundary |
| `app/api/ecommerce/categories/bulk/route.ts` | POST | Admin cookie before DB | Shared local boundary |
| `app/api/ecommerce/categories/route.ts` | GET, POST, PUT, DELETE | None | Shared local boundary |
| `app/api/ecommerce/orders/route.ts` | GET | Admin cookie before DB | Shared local boundary |
| `app/api/ecommerce/orders/[id]/route.ts` | PUT | Admin cookie before DB | Shared local boundary |
| `app/api/ecommerce/products/route.ts` | GET, POST, PUT, DELETE | None | Shared local boundary |
| `app/api/ecommerce/products/[id]/route.ts` | GET | None | Shared local boundary |
| `app/api/ecommerce/products/[id]/route.ts` | PUT, DELETE | Admin cookie before DB | Shared local boundary |
| `app/api/ecommerce/products/bulk/route.ts` | POST | None | Shared local boundary |
| `app/api/ecommerce/variants/route.ts` | GET | Admin cookie before DB | Shared local boundary |
| `app/api/pages/route.ts` | GET, POST | None | Shared local boundary |
| `app/api/pages/[id]/route.ts` | GET, PUT, DELETE | None | Shared local boundary |
| `app/api/[[...slug]]/route.ts` | GET, POST, PUT, PATCH, DELETE | Pass-through | Proxy overwrites header from validated `DB_NAME` |

Authentication still identifies users/admins; deployment configuration supplies
tenant scope. Phase 5B does not add a tenant claim or mapping service.

## Selector disposition and static evidence

- Active server code no longer reads `x-tenant-db`.
- The only active server assignment to `x-tenant-db` is the unconditional
  proxy assignment from validated `DB_NAME`.
- `lib/db.ts`, `lib/apiProxy.ts`, and `app/api/comments/route.ts` contain no
  database authority derived from `NEXT_PUBLIC_TENANT_ID` or
  `NEXT_PUBLIC_TENANT_DB_NAME`.
- Existing browser/thunk callers may continue sending legacy tenant headers.
  Local routes ignore them; the catch-all proxy overwrites them. They are
  presentation/context only.
- Existing collection names are unchanged.
- Shared-instance multi-tenancy is deferred.

Standalone maintenance scripts remain outside application request routing.
They must not be treated as an authorization source or run without separate
operator review. Phase 5B did not execute them.

## API and status-code effects

Successful APIs retain their existing shapes and statuses.

Configuration failure behavior:

- Local database routes continue to use their existing 500 error handling, but
  now fail before Mongo client access when `DB_NAME` is unavailable.
- Comments retains its existing generic error shape.
- The catch-all proxy now returns status 500 with
  `{ "success": false, "error": "Server configuration is unavailable" }`
  before `fetch`. Previously, missing authority could cause a downstream
  request or transport failure. This is the only deliberate response-message
  change.
- Neither the configured database value nor its environment-variable name is
  returned.

## Deterministic test evidence

Final result: 3 test files, 23/23 tests passed.

Phase-5B coverage proves:

1. missing, blank, and invalid server database configuration fails closed;
2. invalid configuration is rejected before Mongo client creation;
3. `NEXT_PUBLIC_TENANT_ID` cannot select a local database;
4. `NEXT_PUBLIC_TENANT_DB_NAME` cannot select a local database;
5. the shared local helper selects only validated `DB_NAME` through a mock;
6. `x-tenant-db` cannot alter the comments database;
7. comments retains its approved successful response shape;
8. missing comments configuration rejects before `getMongoClient()`;
9. the proxy overwrites a caller database header with server authority;
10. missing proxy configuration rejects before `fetch`;
11. rejected responses do not disclose database labels or configuration names;
12. all rejection paths make zero Mongo/network attempts;
13. existing Mongo import-safety and missing-URI tests still pass;
14. missing/blank JWT configuration, invalid tokens, and expired tokens remain
    fail-closed.

Test database labels are non-sensitive symbolic values. MongoDB and application
services were fully mocked or blocked.

## Complete Phase-5B changed-file list

- `app/api/comments/route.ts`
- `docs/NESTCRAFT-ENVIRONMENT-CONTRACT-2026-07-24.md`
- `docs/NESTCRAFT-STABILIZATION-PHASE-5B-AUTHORITY-BLOCKED-2026-07-24.md`
- `docs/NESTCRAFT-STABILIZATION-PHASE-5B-2026-07-24.md`
- `lib/apiProxy.ts`
- `lib/database-authority.ts`
- `lib/db.ts`
- `tests/configuration/mongodb-boundaries.test.ts`
- `tests/configuration/tenant-database-authority.test.ts`

No package dependency or lockfile change was made by Phase 5B.

## Verification under the declared runtime

Commands ran with application credentials absent and a scrubbed process
environment.

| Check | Result |
| --- | --- |
| Node | PASS: `v22.23.1` |
| npm | PASS: `11.11.1` |
| `npm ci` | PASS: 579 packages |
| `npm ls next react react-dom vitest` | PASS |
| Next.js | `15.5.21` |
| React / React DOM | `19.2.6` / `19.2.6` |
| Vitest | `4.1.10` |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 23/23 |
| credential-free `npm run build` | PASS: 16/16 static pages |
| `npm run scan:secrets` | PASS: zero findings |
| `git diff --check` | PASS |
| application DB/network attempts | Zero |

`npm ci` continued to report 9 audit findings: 1 low, 3 moderate, and 5 high.
No audit fix or dependency remediation was performed. These findings remain
separate bounded dependency-remediation work orders and must not be mixed into
Phase 6 commerce integrity.

## Remaining security risks

1. External credential rotation/revocation is `NOT CONFIRMED`.
2. Current-tree containment does not rewrite or clean Git history.
3. Several mutation routes remain unauthenticated; Phase 5B changed tenant
   selection, not route authorization policy.
4. Public tenant headers remain in browser callers as legacy context, although
   they have no server database authority.
5. Maintenance scripts contain historical database-selection assumptions and
   require separate operator review before execution.
6. Shared-instance multi-tenancy is unsupported and requires a separately
   designed authenticated claim and mapping migration.
7. Infrastructure-host transformation details remain duplicated in Mongo
   helpers.

## Scope confirmations

- No Kalp Adapt file or baseline changed.
- No SiteBridge overlay was added.
- No MongoDB, Business Core, or application service was contacted.
- No credential was supplied or used.
- No collection name, pricing, inventory, cart total, checkout, publication
  authority, or commerce behavior changed.
- No tenant mapping service or authenticated tenant claim was introduced.
- No dependency upgrade or audit remediation was performed.
- No commit, push, deployment, baseline acceptance, or Git-history rewrite
  occurred.

Phase 6 commerce-integrity engineering may begin after this report is reviewed.
External rotation/revocation remains a separate release-security block: until
it is confirmed, the branch must remain unpushed and the stabilization baseline
must remain unaccepted.
