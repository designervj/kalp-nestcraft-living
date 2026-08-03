# NestCraft Page data-authority inventory

Date: 2026-08-04

Repository: `kalp-nestcraft-living`

Adapt contract: `PAGE_DATA_AUTHORITY_AUDIT@1.0.0`
Artifact status: `DISCOVERED_CANDIDATE_NOT_AUTHORITY`

This inventory records what the repository currently proves. It does not
calculate a numeric score, certify runtime behavior, configure KCP, or replace
Business Core as the authority for public Page content and commerce data.

## Governed Page read boundary

Public CMS Pages, branding, navigation and the storefront theme now enter
NestCraft through:

`GET /publishing/public/{tenantSlug}/site?page_slug={pageSlug}`

`lib/public-site.ts` is the shared read adapter. It sends no database-selection
header and performs no direct database access. Business Core resolves the
public tenant slug to the correct authority. Same-origin `/api/commerce/*`
remains the storefront boundary for catalog, cart, checkout and orders.

## Route inventory

| Public Page route | Source path | Observed classification | Owning Capability | Expected contract / current boundary |
| --- | --- | --- | --- | --- |
| `/{locale}` | `app/[locale]/page.tsx` | `STATIC_SAMPLE_OR_FALLBACK` | `cms.pages` | Public publishing `home` Page; repository presentation fallbacks remain reachable in composed Sections. |
| `/{locale}/{...slug}` | `app/[locale]/[...slug]/page.tsx` | `AUTHORITATIVE_API` | `commerce.catalog` | Public publishing permalink projection resolves the route before same-origin product/category rendering. |
| `/{locale}/about` | `app/[locale]/about/page.tsx` | `STATIC_SAMPLE_OR_FALLBACK` | `cms.pages` | Public publishing `about` Page; composed Sections preserve repository-authored fallbacks. |
| `/{locale}/blog` | `app/[locale]/blog/page.tsx` | `STATIC_SAMPLE_OR_FALLBACK` | `cms.pages` | Public publishing `blog` Page drives hero/items; repository-authored journal examples are fallback presentation content. |
| `/{locale}/services` | `app/[locale]/services/page.tsx` | `AUTHORITATIVE_API` | `cms.pages` | Public publishing `services` Page drives hero and service items. |
| `/{locale}/contact` | `app/[locale]/contact/page.tsx` | `STATIC_SAMPLE_OR_FALLBACK` | `cms.pages` | Public publishing `contact` Page initializes the rendered contact Sections; address/map presentation fallbacks remain. |
| `/{locale}/faq` | `app/[locale]/faq/page.tsx` | `STATIC_SAMPLE_OR_FALLBACK` | `cms.pages` | Public publishing `faq` Page; repository-authored FAQs remain the explicit empty-content fallback. |
| `/{locale}/shop` | `app/[locale]/shop/page.tsx` | `AUTHORITATIVE_API` | `commerce.catalog` | Same-origin `/api/commerce/*` catalog projection plus public Page metadata. |
| `/{locale}/category` | `app/[locale]/category/page.tsx` | `AUTHORITATIVE_API` | `commerce.catalog` | Same-origin category/catalog projection. |
| `/{locale}/category/{id}` | `app/[locale]/category/[id]/page.tsx` | `AUTHORITATIVE_API` | `commerce.catalog` | Same-origin category detail/catalog projection. |
| `/{locale}/product/{id}` | `app/[locale]/product/[id]/page.tsx` | `AUTHORITATIVE_API` | `commerce.catalog` | Same-origin product slug/id projection; no caller-selected database header. |
| `/{locale}/ecommerce` | `app/[locale]/ecommerce/page.tsx` | `STATIC_SAMPLE_OR_FALLBACK` | `commerce.catalog` | Catalog boundary is observable; repository presentation samples remain reachable. |
| `/{locale}/cart` | `app/[locale]/cart/page.tsx` | `AUTHORITATIVE_API` | `commerce.checkout` | Same-origin cart contract. |
| `/{locale}/checkout` | `app/[locale]/checkout/page.tsx` | `AUTHORITATIVE_API` | `commerce.checkout` | Same-origin checkout contract. Runtime and payment authority remain separate Evidence requirements. |
| `/{locale}/orders` | `app/[locale]/orders/page.tsx` | `AUTHORITATIVE_API` | `commerce.orders` | Authenticated same-origin order projection. |
| `/{locale}/orders/{id}` | `app/[locale]/orders/[id]/page.tsx` | `AUTHORITATIVE_API` | `commerce.orders` | Authenticated same-origin order detail projection. |
| `/{locale}/account` | `app/[locale]/account/page.tsx` | `AUTHORITATIVE_API` | `identity.customer` | Same-origin authenticated customer Capability contract. |
| `/{locale}/login` | `app/[locale]/login/page.tsx` | `AUTHORITATIVE_API` | `identity.customer` | Same-origin authentication boundary. |
| `/{locale}/signup` | `app/[locale]/signup/page.tsx` | `AUTHORITATIVE_API` | `identity.customer` | Same-origin registration boundary. |
| `/{locale}/wishlist` | `app/[locale]/wishlist/page.tsx` | `AUTHORITATIVE_API` | `identity.customer` | Authenticated customer/wishlist boundary; runtime authority still requires Evidence. |
| `/{locale}/kalpauth` | `app/[locale]/kalpauth/page.tsx` | `STATIC_SAMPLE_OR_FALLBACK` | `identity.customer` | Authentication route exists; repository presentation fallback is still reachable. |

## Deterministic result after this change

- Pages inventoried: 21
- `AUTHORITATIVE_API`: 14
- `STATIC_SAMPLE_OR_FALLBACK`: 7
- `DISCONNECTED`: 0
- `MISSING`: 0
- `BROKEN`: 0

The pinned analyzer-owned checksum record is stored outside this target
repository so that adding documentation cannot create a self-referential source
checksum. See the Kalp Adapt artifact
`artifacts/nestcraft-page-authority-candidate-2026-08-04/summary.json`.

## Remaining bounded work

1. Attach the Page audit artifact to the Operations result and Business Core
   Adapt Project response; Admin currently fails closed and labels it missing.
2. Replace repository-authored fallbacks only when approved Page content exists
   and has equivalent design coverage.
3. Add controlled browser Evidence for desktop/mobile Page bodies and important
   interactions.
4. Keep KCP `UNCONFIGURED` until renderer markers, Page identity, theme,
   responsive states and publication authority are explicitly verified.
