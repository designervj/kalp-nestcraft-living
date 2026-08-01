# NestCraft CMS content authority

NestCraft uses three separate authorities. They must not copy or override one
another:

- `business_blueprints_v2` owns business identity, public theme, localization,
  enabled capabilities and vertical configuration.
- `site_pages` owns page SEO, section order, section copy, media references and
  live-entity selection rules.
- Business Core commerce APIs own categories, products, variants, availability
  and prices.

The legacy `business_blueprints` collection is not a storefront input.

## Page ownership

- Home, About, Services, Contact, FAQ, Blog and policy pages: CMS owns their
  complete section composition and SEO metadata.
- Shop and category pages: CMS owns SEO, introductory copy, banners and optional
  promotional sections. Commerce owns category and product results.
- Product pages: CMS owns the reusable product-detail template and SEO policy.
  Commerce owns the selected product, variant, price and availability.
- Cart, checkout, account and order pages: CMS owns SEO and non-transactional
  guidance only. Their state and actions remain owned by the relevant runtime
  service.

## Dynamic slider contract

The homepage `New Essentials Slider` section stores presentation fields plus a
selection rule:

```json
{
  "source": "latest",
  "limit": 8,
  "productSlugs": []
}
```

When `productSlugs` is empty, the storefront displays the first active products
returned by the commerce API. When it contains slugs, it preserves that order
and resolves every product live. Product titles, prices, images and availability
must never be copied into `site_pages`.

The `Shop By Room Section` follows the same pattern:

```json
{
  "source": "catalog",
  "limit": 4,
  "categorySlugs": [
    "living-room",
    "bedroom",
    "dinning-room",
    "office-study"
  ]
}
```

Category labels, images and publication state are resolved from commerce data.

## Kalp Admin builder contract

Kalp Admin's CMS Pages builder should load and edit the same `site_pages`
document used by the storefront. A section inspector should expose:

- localized copy and media fields for ordinary content sections;
- drag-and-drop section ordering and visibility;
- SEO title, description, canonical and indexing controls at page level;
- a commerce-entity picker for product/category sliders that stores only stable
  slugs or IDs;
- source mode and display limit controls;
- a read-only live preview of resolved commerce entities, clearly labelled as
  live data rather than copied CMS content.

The builder must not allow editors to type an authoritative product price,
inventory value, checkout total or order state into a page section. Saving a
page updates `site_pages`; saving business/theme configuration updates
`business_blueprints_v2`; commerce mutations use their dedicated guarded APIs.

## Current implementation boundary

The NestCraft server reads published pages directly from its validated
server-side `DB_NAME` database and derives the website compatibility view from
`business_blueprints_v2`. Database credentials never enter browser code. Static
assets are permitted only as visual fallbacks when a commerce record has no
image; they are not content authority.
