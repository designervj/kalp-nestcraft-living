# Nestcraft Checkout Stabilization — 2026-08-02

## Verified flow

Nestcraft creates server-authoritative quotes and sends one stable idempotency
key for each order and payment-intent operation. Business Core owns pricing,
inventory, customer linkage, order persistence, invoice issuance, payment
webhooks, and tenant isolation.

## Corrections awaiting release

- Nestcraft proxy preserves `Idempotency-Key`; previously the browser created
  it but the proxy dropped it before Business Core order creation.
- COD orders are placed immediately with payment pending collection. Their
  inventory reservation is consumed because no payment-provider webhook will
  arrive for COD.
- Online orders remain `pending_payment` until a signed provider webhook moves
  payment and inventory to their final state.

## Evidence

- Nestcraft: 89 tests, typecheck, and production build pass.
- Business Core: checkout/customer/invoice/idempotency test and payment webhook
  tests pass.
- Admin CI for commit `01344a6` passed; production deploy is still queued on the
  self-hosted runner.

## Remaining live inputs

| Missing input | Why | UI / operational location | Verification |
| --- | --- | --- | --- |
| Online self-hosted runner | Admin and Business Core deploy jobs cannot start | GitHub Actions runner host | Latest deploy jobs start and finish successfully |
| Authenticated Nestcraft Admin session | Role and business switching cannot be observed signed out | `https://zero.kalptree.xyz/login` | Switch business without refresh; sidebar, orders, customers and invoices all match the selected business |
| One non-production checkout | Confirms deployed proxy, database and Admin projections together | Nestcraft storefront checkout using COD | One placed order, one linked customer, one issued invoice, consumed inventory reservation |

No real order or payment should be created until the pending deployment jobs
prove the corrected commits are live.
