# Site Studio project instructions

- Treat `.kalp/site-studio.json` as the site's reviewed capability and field map.
- Save content through the Site Studio draft adapter; never write directly to a
  tenant database or turn a draft into published content.
- Keep media, catalog, and pricing disabled until their separate adapters and
  tests exist. Never encode prices or product records as Page text fields.
- Never copy secrets, customer content, personal data, or tenant database names
  into Patterns, fixtures, logs, or source control.
- Label behavior as confirmed, partial, broken, or unverified and cite its test.
- Preserve site-owned changes. Run focused tests and Site Studio Doctor before
  claiming Setup or service readiness.
