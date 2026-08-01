# NestCraft Stabilization Phase 6A — Commerce Authority Characterization

Date: 2026-07-24
Repository: `/Users/apple/Desktop/WORK/GIT/kalp-os/nestcraft-live`
Branch: `fix/nestcraft-stabilization`
HEAD: `0e598e07ca35ec83b581787cf0e74334ccf79e88`
Outcome: `AUTHORITY_BLOCKED_FOR_PHASE_6B`

## Executive outcome

Phase 6A is complete as a non-mutating characterization checkpoint.

The repository does not contain one coherent commerce authority. It contains
two distinct execution surfaces:

1. `/api/ecommerce/*`: local Next.js routes backed by the deployment database;
2. `/api/commerce/*`: a catch-all proxy to a configured external commerce/API
   service.

Storefront browse, cart, checkout, and customer-order clients predominantly use
the proxied `/api/commerce/*` surface. Product-management components and some
attribute operations also use local `/api/ecommerce/*` routes. Other admin
thunks call a public API base directly.

Repository evidence does not prove whether local MongoDB or the external
service owns canonical catalog, price, inventory, cart, checkout, or order
truth. Phase 6B must not consolidate or repair financial behavior until the
owner selects the canonical authority per domain.

Confirmed current risks include:

- client-authored cart items, prices, quantities, discounts, taxes, shipping,
  and order totals cross NestCraft boundaries without local revalidation;
- local cart persistence accepts complete client item objects;
- local quantity updates accept negative, fractional, excessive, and
  non-numeric values;
- local product listing does not require published/active status;
- local cart writes do not reload product or variant records;
- no local cart/checkout stock validation, reservation, or decrement exists;
- ten local catalog mutation methods are unauthenticated;
- local bulk product mutation is unauthenticated;
- checkout uses browser-calculated values and forwards them to the external
  service;
- NestCraft adds no order idempotency key;
- local order status updates accept arbitrary status strings;
- local customer order creation and detail-read handlers do not exist;
- external enforcement cannot be certified from this repository.

No finding was repaired during Phase 6A.

## Git state and recoverability

Starting state:

- Branch: `fix/nestcraft-stabilization`
- HEAD: `0e598e07ca35ec83b581787cf0e74334ccf79e88`
- Staged changes: none
- Unstaged/untracked changes: reviewed Phase 1–5B work only
- Unrelated changes: none found

Recoverable checkpoints:

| Phase | Checkpoint object |
| --- | --- |
| Phase 1 | `1389df05e8bc288c9ef2ae03a96bc44b4f4ba9a3` |
| Phase 2 | `f981b91a47ed901e2b02d70b41be9faa8497c805` |
| Phase 3 | `c475b383a5e474f6b176d3f51beff29abd9ce705` |
| Phase 4 | `00f78ee3e5cfb20cdf0324deb69b5b089a3d0e43` |
| Phase 5A | `3f6fb68974e27fa588fd889cb30963c71f50179e` |
| Phase 5B | `a0d4df0f8a3e29e20e139ed48230da21b498332d` |

These are recoverable Git stash objects, not commits. The Phase-5B checkpoint
was created and immediately reapplied before Phase 6A.

Ending state:

- Branch and HEAD unchanged
- No staged, committed, or pushed changes
- Existing Phase 1–5B files unchanged by Phase 6A
- Phase 6A adds only the report and five characterization test files listed
  below
- Generated `tsconfig.tsbuildinfo` remains working-tree metadata

## External security status

Credential rotation/revocation: `NOT CONFIRMED`

Phase 5A current-tree containment and Phase 5B/6A test success do not prove
external revocation or historical Git cleanup. The branch remains unpushed; no
deployment or baseline acceptance is permitted.

No credential, real tenant, customer, product, order, or service identifier was
used in Phase 6A.

## Commerce surface architecture

```text
Storefront browser
  ├── /api/commerce/* --------------------┐
  │                                       v
  │                             catch-all Next.js proxy
  │                                       |
  │                             configured external API
  │                                       |
  │                         persistence/validation unknown
  │
  └── selected admin forms -> /api/ecommerce/*
                                          |
                                  local Mongo collections

Other admin thunks -> NEXT_PUBLIC_API_BASE_URL/commerce/*
                     (direct browser-to-external path)
```

Phase 5B guarantees that the catch-all proxy overwrites database headers from
validated server configuration. It does not prove that the external commerce
service revalidates price, inventory, ownership, order, or payment data.

## Complete local commerce route inventory

### Attributes

| Path/method | Operation | Auth / authorization | Input and persistence | Financial/inventory effect | Response | Risk/evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/ecommerce/attributes` GET | List attribute sets | None | Local `attribute_sets` read | None | 200 `{data,message}`; 500 generic | Public metadata read; `app/api/ecommerce/attributes/route.ts` |
| same POST | Create attribute set | None | Entire client body inserted | None | 200 `{data,message}`; 500 | Unauthenticated mutation and no schema; same path |
| same PUT | Update attribute set | None | Entire body `$set` by query ID | None | 200; 400 missing ID; 500 | Unauthenticated arbitrary-field update |
| same DELETE | Delete attribute set | None | Delete by query ID | Indirect catalog effect | 200; 400/404/500 | Unauthenticated destructive mutation |
| `/api/ecommerce/attributes/bulk` POST | Bulk create | Admin cookie | Per-record client body with defaults | Indirect catalog effect | 200 `{success,message,data}`; 400/401/500 | Admin-gated, but partial per-item writes and no transaction |

### Categories

| Path/method | Operation | Auth / authorization | Input and persistence | Financial/inventory effect | Response | Risk/evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/ecommerce/categories` GET | List | None | Local `categories` read; optional type filter | None | 200 array; 500 | No publication filter |
| same POST | Create | None | Client body inserted after slug-existence check | Indirect catalog effect | 200 object; 400 duplicate; 500 | Unauthenticated mutation |
| same PUT | Update | None | Client body except `_id` is `$set` | Indirect catalog effect | 200; 400/404/500 | Unauthenticated arbitrary-field update |
| same DELETE | Delete | None | Blocks only detected subcategory, then deletes | Indirect catalog effect | 200; 400/404/500 | Unauthenticated destructive mutation |
| `/api/ecommerce/categories/bulk` POST | Bulk create | Admin cookie | Per-record client body/defaults | Indirect catalog effect | 200 counts; 400/401/500 | Partial writes; errors are counted as skipped |

### Products and variants

| Path/method | Operation | Auth / authorization | Input and persistence | Financial/inventory effect | Response | Risk/evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/ecommerce/products` GET | List products with variants | None | Local aggregate; search/status/category are caller filters | Reads product/variant price and stock | 200 `{message,data}`; 500 | With no status filter, draft/inactive records are returned |
| same POST | Create product and variants | None | Spreads client product and variant documents | Client authors price, cost, tax flag and stock | 200 `{message,data,id}`; 500 | Unauthenticated; product insert can survive variant failure |
| same PUT | Update product and variants | None | `$set` client product body, then update/insert variants | Client authors price and stock | 200; 400 missing ID; 500 | Unauthenticated; sequential partial writes; removed variants are not deleted |
| same DELETE | Archive product/inactivate variants | None | Two sequential updates | Changes availability | 200; 400/500 | Unauthenticated; product and variant updates are not transactional |
| `/api/ecommerce/products/[id]` GET | Product detail | None | Local aggregate by object ID or slug | Reads prices/stock | 200; 404/500 | No active/published/availability constraint |
| same PUT | Replace/update product and variants | Admin cookie | Product body `$set`; deletes all variants then reinserts | Client authors price/stock | 200; 401/404/500 | Delete/reinsert can leave partial variant state |
| same DELETE | Hard delete product and variants | Admin cookie | Sequential product then variant deletion | Removes catalog/stock records | 200; 401/404/500 | No transaction; product can be deleted before variant failure |
| `/api/ecommerce/products/bulk` POST | Bulk product/variant create | None | Client array; attribute lookup; sequential inserts | Client authors price and stock | 200 `{message,data}`; 500 | Unauthenticated; no array/schema guard; extensive partial-write risk |
| `/api/ecommerce/variants` GET | List variants | Admin cookie | Local `variants` read | Exposes price and stock | 200 array; 401/500 | Admin authentication only; no finer role check |
| `/api/ecommerce/upload` POST | Product asset upload | Admin cookie | Writes file into public assets | None | 200 `{success,url}`; 400/401/500 | Admin-gated; file-security review is separate |

### Local cart

| Path/method | Operation | Auth / authorization | Input and persistence | Financial/inventory effect | Response | Risk/evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/ecommerce/cart` GET | Read/merge cart | Guest cookie or optional verified `userId` | Reads guest cart, then user cart; may merge and delete guest cart | Adds client-stored quantities; no price/stock reload | 200 `{message,data,status}`; 500 | Guest token possession is ownership; merge is multi-write/non-transactional |
| same POST | Add item | Guest cookie or optional verified `userId` | Entire client item is inserted or merged by client `cartItemId` | Client price/discount/total fields persist; quantity blindly added | 200 same envelope; 500 | No product, variant, publication, availability, stock or numeric validation |
| same PUT | Set quantity | Guest cookie or optional verified `userId` | Client `cartItemId` and quantity update embedded item | Zero removes; negative/fractional/excessive/non-numeric persist | 200 same envelope; 500 | No bounds or type validation |
| same DELETE | Remove/clear | Guest cookie or optional verified `userId` | Filters embedded items or clears cart | No inventory restoration | 200 same envelope; 500 | Token/user claim selects cart; no inventory interaction |

Cart ownership details:

- guest authority is possession of the HTTP-only `cart_session_id` cookie;
- authenticated authority is the verified `kalp_session` JWT `userId`;
- invalid/missing JWT configuration falls back to guest behavior;
- request bodies cannot directly choose `userId` or `sessionId`;
- there is no server-side cart capability record beyond the cookie value;
- merge reads/writes/deletes are not transactional or idempotent.

### Local orders

| Path/method | Operation | Auth / authorization | Input and persistence | Financial/inventory effect | Response | Risk/evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/ecommerce/orders` GET | Admin order list | Admin cookie | Optional status query only; reads all matching local orders | Reads stored totals | 200 array; 401/500 | Supplied `user_id` is ignored; this is not a customer ownership endpoint |
| `/api/ecommerce/orders/[id]` PUT | Admin order update | Admin cookie | Accepts arbitrary `status`, notes and shipping address | Does not recalculate price or affect inventory | 200 `{success,message,order}`; 401/404/500 | No status enum/state machine, concurrency guard or audit invariant |

There is no local `/api/ecommerce/orders` POST and no local
`/api/ecommerce/orders/[id]` GET. Local order creation, customer ownership,
checkout, payment, inventory decrement, refunds, and fulfillment do not exist.

## Proxied and direct external commerce inventory

The catch-all `app/api/[[...slug]]/route.ts` forwards `/api/commerce/*` through
`lib/apiProxy.ts`. It supports GET, POST, PUT, PATCH, and DELETE and preserves
downstream status/body.

Repository callers use or describe:

| External path | Methods observed | Purpose | Local validation before forwarding |
| --- | --- | --- | --- |
| `/api/commerce/products` | GET, POST | Browse/create products | None beyond proxy configuration |
| `/api/commerce/products/{id}` | GET, PUT, DELETE | Detail/mutations | None |
| `/api/commerce/products/bulk` | POST | Bulk import | None |
| `/api/commerce/categories` and `/{id}` | GET, POST, PUT, DELETE | Category CRUD | None |
| `/api/commerce/categories/bulk` | POST | Bulk category import | None |
| `/api/commerce/attribute-sets` | GET | Attribute read | None |
| `/api/commerce/attributes` and `/{id}` | POST, PUT and admin reads | Attribute management | None |
| `/api/commerce/cart` | GET, POST, PUT, DELETE | Storefront cart | Body/query forwarded unchanged |
| `/api/commerce/orders` | GET, POST | Customer reads and checkout order creation | Body/query forwarded unchanged |
| `/api/commerce/orders/{id}` | GET | Customer order detail | None locally |
| `/api/commerce/orders/{id}/payment` | POST | Payment verification request | Body/provider query forwarded unchanged |
| `/api/commerce/variants` | GET | Admin variant list | None locally |
| `/api/commerce/menus` | GET | Menu data | None locally |

Some category, attribute, variant, and order admin thunks call
`NEXT_PUBLIC_API_BASE_URL` directly instead of using the server proxy. Those
browser requests bypass NestCraft's proxy validation and rely entirely on the
external service's authentication, authorization, tenant, and integrity
controls.

External response and persistence semantics are not present in this repository.
They cannot be classified as trusted merely because the client calls them.

## Commerce data/model inventory

| Domain | Current representation | Authority concerns |
| --- | --- | --- |
| Products | Flexible Mongo documents in `products`; Redux `ProductFormState` | Both top-level `price` and nested `pricing.price` exist; strings/numbers mixed; client bodies are spread into documents |
| Variants | Separate `variants` collection linked by `productId` | Price, stock and status are client-authored; multiple route implementations update them differently |
| Attributes | `attribute_sets` collection | Local base CRUD unauthenticated; bulk admin-gated |
| Categories | `categories` collection | Local base CRUD unauthenticated; no publication authority |
| Carts | `carts` collection with embedded full client item objects | Contains copied product/variant/price fields; no canonical line schema or server reload |
| Cart subtotal | Redux selector over client-held item/variant prices | Browser-authoritative in NestCraft; negative quantities affect totals |
| Discounts | Hard-coded browser coupon logic | No server coupon authority or validation evidenced |
| Tax | Browser calculation from Business Blueprint data | Blueprint source and server enforcement unresolved |
| Shipping | Browser calculation from Business Blueprint data | No server revalidation evidenced |
| Currency | Checkout formatting/payload hard-codes INR | No canonical currency policy or multi-currency rule |
| Inventory | Product/variant `stock` fields | No cart/checkout enforcement, reservation, decrement, release or oversell control |
| Orders | Local `orders` collection is read/admin-updated; creation is external | Local and external order authority relationship unresolved |
| Order status | Free-form local `status` plus client-built `statusHistory` | No state machine, actor policy, audit rule or optimistic concurrency |
| Payments | Browser gateway registry plus proxied verification call | Provider authority, server amount binding and replay behavior unresolved |
| Business Blueprint | Browser state supplies tax, shipping and payment configuration | Publication/version authority and integrity are not proven here |

No strict commerce request schemas, database schema validators, transaction
boundaries, reservation records, idempotency records, or authoritative money
type were found.

## Authority classification matrix

| Domain | Current classification | Repository-supported current behavior | Recommended secure direction | Owner decision before Phase 6B |
| --- | --- | --- | --- | --- |
| `CATALOG_AUTHORITY` | `AUTHORITY_UNRESOLVED` | Local Mongo and external commerce APIs both read/write catalog | Select one canonical catalog service; make the other an adapter/cache | Local Mongo or Business Core? |
| `PRICE_AUTHORITY` | `CLIENT_CONTROLLED_CURRENTLY` | Local carts copy client price; checkout forwards browser price/totals; external revalidation unknown | Reload authoritative price server-side at cart/checkout | Choose canonical price source, money precision and currency |
| `DISCOUNT_AUTHORITY` | `CLIENT_CONTROLLED_CURRENTLY` | Browser recognizes two hard-coded coupons and submits discount | Server-owned promotion rules and eligibility | Define promotion owner, codes, stacking and expiry |
| `INVENTORY_AUTHORITY` | `AUTHORITY_UNRESOLVED` | Stock fields exist locally; no enforcement; external behavior unknown | One inventory owner with atomic reservation/decrement policy | Choose owner and oversell/reservation behavior |
| `CART_OWNERSHIP_AUTHORITY` | Mixed `GUEST_CART_TOKEN` / `AUTHENTICATED_USER` locally; external `AUTHORITY_UNRESOLVED` | Local cookie/JWT selects cart; public client uses external API | Preserve secure guest capability and bind user cart server-side | Decide canonical cart service and merge semantics |
| `CHECKOUT_AUTHORITY` | `CLIENT_CONTROLLED_CURRENTLY` at NestCraft boundary | Browser calculates and submits financial payload; proxy passes through | Server revalidates catalog, price, discount, tax, shipping and inventory | Choose checkout service and validation contract |
| `ORDER_OWNERSHIP_AUTHORITY` | Local admin: `ADMIN_ROLE`; customer: `AUTHORITY_UNRESOLVED` | Local list/update is admin-only; customer reads are external | Customer reads bound to authenticated owner; admin reads role-gated | Define customer identity/order ownership source |
| `ORDER_STATUS_AUTHORITY` | `ADMIN_ROLE` locally, but transition rules `AUTHORITY_UNRESOLVED` | Any admin-authenticated caller can set any status string | Explicit transition graph, actor permissions and audit history | Approve statuses/transitions and fulfillment owner |
| `MUTATION_AUTHORIZATION_AUTHORITY` | Mixed `ADMIN_ROLE` and `CLIENT_CONTROLLED_CURRENTLY` | Ten local catalog mutations have no authentication; some bulk/item routes are admin-gated | One consistent role/capability policy | Decide public/admin/service-only policy per mutation |
| `EXTERNAL_COMMERCE_AUTHORITY` | `AUTHORITY_UNRESOLVED` | Proxy/direct callers trust uninspected downstream behavior | Document and test a versioned service contract | Identify service owner and guarantees for every proxied domain |

`CLIENT_CONTROLLED_CURRENTLY` describes the NestCraft boundary. It does not
prove that the external service persists the submitted value unchanged.

## End-to-end journey traces

### 1. Browse products and variants

Primary storefront flow:

`productsThunk` or page helper → `/api/commerce/products[...]` → catch-all proxy
→ external service → Redux/UI.

- caller supplies search/category/pagination;
- external catalog filtering, publication and price authority are unknown;
- local product GET is a separate path and returns draft/inactive data unless
  the caller explicitly supplies a status filter;
- neither local product detail nor local list automatically restricts variant
  status/stock.

### 2. Add an item to a guest cart

Storefront flow:

UI item object → `/api/commerce/cart` → proxy → external service.

Local alternative:

client item object → local cart POST → guest cookie lookup → embedded item
insert/update.

- product/variant ID, selected options, price, status and quantity are
  client-supplied;
- no local product or variant reload occurs;
- no publication, activity, stock or price validation occurs;
- local write is one cart insert/update, with no inventory effect.

### 3. Change cart quantity

`cartItemId` + arbitrary quantity → proxied external cart or local cart PUT.

Local behavior:

- exactly numeric zero removes the item;
- negative, fractional, excessive and non-numeric values persist;
- no stock check or maximum exists;
- returned success envelope remains 200 even when the item is absent.

### 4. Remove a cart item

`cartItemId` query → proxied external cart or local guest/user cart filter.

- local ownership comes only from cookie/JWT-selected cart;
- no inventory restore occurs;
- clear rotates the cart session cookie;
- retries are not assigned idempotency identifiers.

### 5. Associate/merge authenticated cart

Local cart GET:

verified JWT `userId` + guest session → read guest cart → read user cart →
merge quantities by client `cartItemId` → update user cart → delete guest cart.

- invalid/missing JWT configuration makes the request a guest request;
- no product/price/stock revalidation occurs during merge;
- update and delete are separate, non-transactional operations;
- concurrent/retried merges can duplicate quantities.

External cart merge behavior is unknown.

### 6. Calculate cart subtotal and total

Redux `selectCartTotal` uses `selectedVariant.price`, then item `price` or
`pricing.price`, multiplied by client-held quantity.

- no server reload or money type;
- browser values may be strings or numbers;
- negative/fractional quantities affect the result;
- client computes a 5% shipping helper elsewhere, while checkout also reads
  Business Blueprint shipping rules.

### 7. Begin and validate checkout

Checkout browser:

cart Redux state + hard-coded coupon rules + blueprint tax/shipping → browser
`orderTotal` → POST `/api/commerce/orders` → proxy → external service.

- NestCraft does not reload products/variants;
- NestCraft does not check published/active state or stock;
- prices, subtotal, discount, tax, shipping and total are forwarded unchanged;
- customer addresses and status history are client-authored;
- external validation is unresolved.

### 8. Create an order

No local order POST exists. Order creation is external through the proxy.

- NestCraft supplies no idempotency key;
- an identical retry produces another downstream POST;
- whether duplicate orders result is external and unresolved;
- COD completion clears the cart after a successful external response;
- partial failure can leave an external order while the cart remains uncleared
  or payment verification fails.

### 9. View an order

Customer UI calls proxied `/api/commerce/orders` or
`/api/commerce/orders/{id}`.

- `user_id` can be supplied by the client list helper;
- customer ownership enforcement is entirely external;
- local order list is admin-only and ignores `user_id`;
- no local order-detail GET exists.

### 10. Change an order status

Local admin PUT → order ID → arbitrary client `status`, notes and shipping
address → one `findOneAndUpdate`.

- admin authentication occurs before model access;
- no transition graph, expected-current-status condition, version check or
  fulfillment side effect;
- arbitrary strings are accepted;
- status-history consistency is not maintained here.

### 11. Create/update/delete a product

Two competing flows exist:

- storefront/admin Redux thunks generally use proxied external paths;
- product form components use local `/api/ecommerce/products` routes.

Local base-route POST/PUT/DELETE are unauthenticated. Item-route PUT/DELETE are
admin-gated. Their document shapes and deletion semantics differ.

Product/variant multi-write operations have no transaction or rollback.

### 12. Bulk catalog mutations

- local products bulk POST: unauthenticated; sequential product and variant
  writes; no rollback;
- local categories bulk POST: admin-gated; per-item partial success;
- local attributes bulk POST: admin-gated; per-item partial success;
- external bulk endpoints: authentication, atomicity and validation unresolved;
- maintenance import scripts can write directly to MongoDB and were not run.

## Deterministic characterization tests

Phase 6A added 5 files and 22 tests:

- `tests/commerce/cart-integrity-characterization.test.ts`
- `tests/commerce/catalog-integrity-characterization.test.ts`
- `tests/commerce/mutation-authorization-characterization.test.ts`
- `tests/commerce/order-integrity-characterization.test.ts`
- `tests/commerce/proxied-commerce-characterization.test.ts`

They use generated/symbolic records, mocked collections, mocked fetch, and the
existing process-wide network guard. No test fixture contains a real product,
tenant, customer, order, database, credential, or service endpoint.

### Test-to-risk traceability

| Risk/requirement | Characterized by |
| --- | --- |
| Client price accepted locally | Local cart POST and local product POST tests |
| Client price/total forwarded externally | Proxied cart and order tests |
| Zero quantity | Local cart zero-removal test |
| Negative/fractional/excessive/non-numeric quantity | Parameterized local cart PUT tests |
| Product/variant revalidation | Local cart persists symbolic IDs without model lookup |
| Unpublished product | Local catalog GET and cart POST tests |
| Inactive/unavailable variant | Local catalog GET and cart POST tests |
| Subtotal/total recalculation | Redux selector and proxy payload tests |
| Client discount/tax/shipping effect | Proxied order test |
| Guest ownership | Guest cookie selector test |
| Authenticated cart ownership | Verified `userId` selector test |
| Invalid/missing JWT | Existing Phase 4/5A auth tests |
| Checkout revalidation | Checkout source and proxy pass-through tests |
| Insufficient inventory | Zero-stock fixtures accepted/forwarded |
| Duplicate order/retry | Repeated proxied POST has no idempotency key |
| Order transitions | Arbitrary local admin status update test |
| Catalog mutation authentication | Complete AST-derived route matrix |
| Bulk authentication | Route matrix plus local product bulk behavior test |
| Missing/invalid DB authority | Existing Phase 5B tests |
| Tenant/database selector ineffectiveness | Existing Phase 5B tests plus proxy header assertion |
| Successful response compatibility | Cart, catalog, order and proxy response assertions |
| Secret regression | `npm run scan:secrets` |

Static route reconciliation discovers every `route.ts` below
`app/api/ecommerce`, extracts every active exported HTTP method with the
TypeScript parser, and compares it to the reviewed authority matrix. All 12
route files and 26 exported methods are represented.

## Confirmed integrity findings

### Client-authoritative financial fields

- local cart accepts copied item/variant prices and arbitrary financial fields;
- Redux computes subtotal from client-held values;
- checkout computes coupons, tax, shipping and total in the browser;
- proxy forwards those values unchanged;
- external server recalculation is not evidenced.

### Quantity and identity

- no numeric/integer/minimum/maximum quantity schema;
- zero and string `"0"` have different behavior;
- `cartItemId` is client-generated and is the merge identity;
- cart does not verify product/variant relationship;
- inactive/unpublished/zero-stock records can be represented and persisted
  locally.

### Ownership

- local guest ownership is cookie-token possession;
- local authenticated ownership is JWT `userId`;
- merge is non-transactional;
- external customer/cart/order ownership is unresolved;
- client list helper can submit `user_id`; whether it is trusted externally is
  unknown.

### Mutation authorization

Unauthenticated local mutations:

1. attributes POST
2. attributes PUT
3. attributes DELETE
4. categories POST
5. categories PUT
6. categories DELETE
7. products POST
8. products PUT
9. products DELETE
10. products bulk POST

Admin-gated local mutations:

- attributes bulk POST;
- categories bulk POST;
- products item PUT/DELETE;
- order item PUT;
- upload POST.

The duplicate product mutation surfaces conflict: base-route mutations are
public while item-route mutations require admin.

### Inventory and checkout

- stock fields are descriptive only in this repository;
- cart and checkout do not reserve, decrement, restore or validate stock;
- no oversell protection or inventory transaction exists;
- no checkout request schema exists;
- no server-side binding of payment amount to authoritative order total is
  evidenced;
- payment provider and verification behavior are external/unresolved.

### Idempotency, partial writes and transitions

- no order idempotency key or local deduplication;
- product/variant create/update/delete operations are multi-write without
  transactions;
- bulk routes intentionally permit partial success;
- cart merge is update-plus-delete without transaction;
- order status has no state machine, compare-and-set, version or history rule.

### Information disclosure

- multiple local 500 responses return raw `error.message`;
- admin order/customer objects may contain addresses and payment metadata;
- external rejection disclosure cannot be inspected here;
- Phase 5B prevents database names from appearing in configured rejection
  responses.

## Owner decisions required before Phase 6B

1. **Canonical service per domain:** choose local MongoDB or Business Core for
   catalog, price, inventory, cart, checkout and orders. Mixed transitional
   states must be declared explicitly.
2. **Mutation policy:** identify which catalog mutations are admin-only,
   service-only, or intentionally public. Public product/category/attribute
   mutation is not presumed valid.
3. **Money contract:** choose canonical currency, integer-minor-unit or decimal
   representation, rounding, compare-at-price and tax-inclusion rules.
4. **Price source:** product, variant, price list, quote service, or external
   commerce service.
5. **Discount source:** define promotion codes, eligibility, expiry, stacking,
   maximums and audit ownership.
6. **Quantity policy:** integer/minimum/maximum and per-line/per-cart limits.
7. **Publication/availability:** define product and variant states allowed for
   browse, cart and checkout.
8. **Inventory policy:** choose stock owner, missing-stock behavior,
   reservation timing, expiry, decrement, release and oversell handling.
9. **Cart authority:** choose local or external cart, guest token lifecycle,
   login merge conflict rule and retry behavior.
10. **Checkout authority:** choose the service that revalidates price,
    discount, tax, shipping, inventory and customer data.
11. **Order idempotency:** define key source, scope, retention and response for
    repeated submission.
12. **Order ownership:** define authenticated customer claim and admin/support
    access policy.
13. **Order state machine:** approve statuses, transitions, actors,
    cancellation/refund/fulfillment effects and history invariants.
14. **Payment boundary:** identify the service that creates provider orders,
    signs/verifies requests and binds charged amount/currency to the canonical
    order.
15. **External contract:** provide the API owner, version and evidence for every
    proxied commerce guarantee.

Until at least decisions 1–4, 7–10, and 12–15 are made, financial and inventory
repairs are `AUTHORITY_BLOCKED`.

## Proposed Phase 6B checkpoints

Each checkpoint should be independently reviewed and retain same-checkpoint
tests and rollback instructions.

### 6B.1 — Mutation authentication and authorization

- Smallest correction: apply one evidence-approved admin/service guard to every
  catalog mutation surface; remove or route around duplicates only after
  canonical service selection.
- Files: local attributes/categories/products/bulk routes and affected external
  callers.
- Contract effect: new 401/403 responses for unauthorized mutations.
- Data migration: none.
- Tests: every mutation unauthenticated/invalid/valid role; no DB access on
  rejection.
- Rollback: restore guard wiring only; do not restore public mutation without
  explicit security approval.

### 6B.2 — Product, variant and quantity validation

- Validate identifiers, relationship, published/active state and integer
  quantity bounds at the canonical cart boundary.
- Contract effect: deterministic 400/404/409/422 decisions require owner
  approval.
- Migration: malformed existing cart lines may require invalidation.
- Tests: stale/deleted product, inactive variant, mismatch, zero/negative/
  fractional/excessive quantity.
- Rollback: feature flag/read-only compatibility period if existing carts are
  affected.

### 6B.3 — Server-authoritative pricing and cart totals

- Reload canonical price and calculate money server-side; never persist or
  return client totals as authority.
- Contract effect: returned cart lines/totals may differ from client submission.
- Migration: existing copied cart prices must be refreshed or marked stale.
- Tests: price tampering, variant pricing, rounding, currency and stale-price
  conflicts.
- Rollback: preserve previous values as non-authoritative display metadata only.

### 6B.4 — Cart ownership and guest-session isolation

- Bind cart operations to server-derived guest/user authority; make merge
  atomic/idempotent.
- Contract effect: unauthorized cart access becomes 401/403/404 per decision.
- Migration: guest cart token rotation and duplicate-user-cart consolidation.
- Tests: cross-guest/user access, token rotation, concurrent/retried merge.
- Rollback: retain recoverable cart records; never re-enable caller-selected
  ownership.

### 6B.5 — Inventory validation/reservation

- Use the chosen inventory authority to validate and atomically reserve or
  decrement stock.
- Contract effect: insufficient inventory conflict response.
- Migration: reconcile existing stock and open carts/orders.
- Tests: concurrent last-unit purchase, reservation expiry, cancellation and
  failed-payment release.
- Rollback: release reservations safely; do not silently oversell.

### 6B.6 — Checkout revalidation and idempotency

- Canonical checkout command reloads all commerce inputs and stores an
  idempotency record before external effects.
- Contract effect: client financial fields become advisory/ignored; repeated
  key returns original result.
- Migration: none or versioned endpoint depending on external contract.
- Tests: tampering, replay, partial provider failure, retry and recovery.
- Rollback: disable new checkout entry while preserving created order records.

### 6B.7 — Order ownership and status transitions

- Customer reads use authenticated owner; admin actions use role guard; status
  changes use an approved transition graph and audit history.
- Contract effect: new 401/403/409 responses and rejected invalid transitions.
- Migration: normalize unknown historical statuses before enforcement.
- Tests: cross-user reads, role matrix, every allowed/forbidden transition,
  concurrency and history consistency.
- Rollback: pause mutations while retaining readable order history.

Payment capture, refunds and fulfillment implementation remain outside Phase 6B
unless separately authorized.

## Complete Phase-6A changed-file list

- `docs/NESTCRAFT-STABILIZATION-PHASE-6A-2026-07-24.md`
- `tests/commerce/cart-integrity-characterization.test.ts`
- `tests/commerce/catalog-integrity-characterization.test.ts`
- `tests/commerce/mutation-authorization-characterization.test.ts`
- `tests/commerce/order-integrity-characterization.test.ts`
- `tests/commerce/proxied-commerce-characterization.test.ts`

Test configuration remains the Phase-4 Vitest configuration and network guard.
No package or lockfile was changed by Phase 6A.

## Verification

Final verification uses Node `v22.23.1`, npm `11.11.1`, application credentials
absent, and a scrubbed environment.

| Check | Result |
| --- | --- |
| `npm ci` | PASS: 579 packages |
| `npm ls next react react-dom vitest` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 8 files, 45/45 tests |
| credential-free `npm run build` | PASS: 16/16 static pages |
| `npm run scan:secrets` | PASS: zero findings |
| `git diff --check` | PASS |
| route inventory reconciliation | PASS: 12 files, 26 methods |
| Phase-6A focused tests | PASS: 22/22 |
| database/application-service contact | Zero |

The precondition run passed all prior 23 tests, typecheck, build, secret scan,
and diff check before Phase-6A files were added.

The existing npm audit result remains 9 findings: 1 low, 3 moderate, and 5 high.
No audit remediation was attempted. Dependency remediation remains separate
from commerce integrity.

## Scope confirmation

- No production commerce file or behavior changed.
- No successful API response contract changed.
- `DB_NAME` authority is unchanged.
- No database, Business Core, payment provider or application service was
  contacted.
- No real or fake credential was supplied.
- No dependency, npm audit finding, baseline or SiteBridge file changed.
- No payment capture, refund, fulfillment or new business policy was added.
- No commit, push, deployment, baseline acceptance or Git-history rewrite
  occurred.
