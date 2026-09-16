import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Single-language mode: English only
const locales = ["en"];
const defaultLocale = "en";
const internalLocaleHeader = "x-nestcraft-internal-locale";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // A rewrite re-enters middleware with the localized internal pathname.
  // Preserve that internal request instead of redirecting it back to the
  // public clean URL.
  if (req.headers.get(internalLocaleHeader) === defaultLocale) {
    return NextResponse.next();
  }

  // Skip locale processing for admin routes—they have their own layout
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // If path has a locale prefix (/en or /en/*), strip it
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const cleanPath = pathname.replace(`/${defaultLocale}`, "") || "/";
    const url = new URL(cleanPath, req.url);
    return NextResponse.redirect(url, 301);
  }

  // Strip any other 2-letter locale prefix (redirects /hi, /fr etc. to clean URL)
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (localeMatch) {
    const cleanPath = pathname.replace(/^\/[a-z]{2}/, "") || "/";
    const url = new URL(cleanPath, req.url);
    return NextResponse.redirect(url, 301);
  }

  // No locale in URL → rewrite so [locale] routes match (URL stays clean)
  // Avoid rewriting "/" to "/en/". Next.js canonicalizes that internal
  // trailing slash to "/en", which then re-enters this middleware and
  // redirects to "/", creating a loop.
  const localizedPath =
    pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
  const url = new URL(localizedPath, req.url);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(internalLocaleHeader, defaultLocale);

  return NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets|uploads).*)"],
};
