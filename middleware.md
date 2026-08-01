# Middleware — Locale Routing

The middleware at `middleware.ts` handles internationalization (i18n) routing by managing locale prefixes in the URL.

## Behavior

| Incoming URL | Action | Result |
|---|---|---|
| `/` or `/about` | Internal rewrite to `/en{path}` | URL stays clean, locale is `en` |
| `/en` or `/en/about` | 301 redirect strips default locale | URL becomes `/` or `/about` |
| `/hi` or `/hi/about` | 301 redirect strips locale prefix | URL becomes `/` or `/about` (English) |
| `/admin*` | Pass through (skipped entirely) | Admin has its own layout |

## Locale Resolution

**Single-language mode (English only).** Locales are hardcoded in `middleware.ts`:

```typescript
const locales = ["en"];
const defaultLocale = "en";
```

No MongoDB lookup is performed. Any non-English locale prefix (`/hi`, `/fr`, etc.) is recognized as a 2-letter prefix and redirected to the clean URL.

## How It Works

1. **Admin routes** (`/admin*`) are excluded from locale processing so standalone admin pages work without a locale prefix.
2. **Locale prefix detected** (`/en`, `/hi`, etc.): the middleware strips it via 301 redirect to the clean URL.
3. **No locale in URL**: The path is internally rewritten (not redirected) to `/en{path}` — the browser URL remains clean while Next.js renders the correct locale route.

## SEO

Default locale URLs (e.g., `/en/about`) get a **301 permanent redirect** to the clean URL (`/about`), ensuring search engines index the canonical clean URL.

## Matcher

```typescript
matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
```

API routes, static assets, and favicon are excluded.
