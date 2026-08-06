import { cache } from "react";
import { normalizeCommerceProduct } from "./commerce/product-normalization";
import {
  blueprintFromPublicSite,
  brandingFromPublicSite,
  fetchPublicSitePage,
  normalizePublicPage,
} from "./public-site";

function serialize(obj: any): any {
  if (obj === null || obj === undefined) return null;
  return JSON.parse(
    JSON.stringify(obj, (_, value) => {
      return value;
    }),
  );
}

export const getPageData = cache(async (slug: string) => {
  try {
    return serialize(normalizePublicPage(await fetchPublicSitePage(slug)));
  } catch (error) {
    console.error(`Error in getPageData for slug: ${slug}`, error);
    return null;
  }
});

export const getSingleProduct = cache(async (id: string) => {
  const SITE_URL = process.env.SITE_URL || "http://127.0.0.1:3000";
  try {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include" as const,
    };
    let res = await fetch(
      `${SITE_URL}/api/commerce/products/slug/${encodeURIComponent(id)}`,
      requestOptions,
    );
    if (res.status === 404) {
      res = await fetch(
        `${SITE_URL}/api/commerce/products/${encodeURIComponent(id)}`,
        requestOptions,
      );
    }

    if (res.ok) {
      const json = await res.json();
      const data = json?.data !== undefined ? json.data : json;
      if (data) return normalizeCommerceProduct(serialize(data));
    }

    // Business Core currently resolves canonical IDs at the detail endpoint,
    // while public cards and search results use slugs. Resolve those read-only
    // identifiers against the authoritative catalog when detail returns null or 404.
    let catalogResponse = await fetch(
      `${SITE_URL}/api/commerce/products`,
      requestOptions,
    );

    if (!catalogResponse.ok) {
      const backendBase = (
        process.env.FASTAPI_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://127.0.0.1:8000"
      ).replace(/\/$/, "");

      let dbHeader: Record<string, string> = {};
      try {
        const { getConfiguredDatabaseName } = await import("./database-authority");
        dbHeader = { "x-tenant-db": getConfiguredDatabaseName() };
      } catch {
        // preserve unconfigured state if DB_NAME is missing
      }

      catalogResponse = await fetch(`${backendBase}/commerce/products`, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...dbHeader },
      });
    }

    if (!catalogResponse.ok) return null;

    const catalogJson = await catalogResponse.json();
    const catalog = catalogJson.data !== undefined ? catalogJson.data : catalogJson;
    if (!Array.isArray(catalog)) return null;

    const exactMatch = catalog.find(
      (product: any) =>
        product?.id === id || product?._id === id || product?.slug === id,
    );
    if (exactMatch) return normalizeCommerceProduct(serialize(exactMatch));

    // Preserve existing CMS-authored homepage links until their product
    // bindings are migrated from legacy p-N positions to canonical IDs.
    const legacyPosition = /^p-(\d+)$/.exec(id)?.[1];
    if (!legacyPosition) return null;

    const activeProducts = catalog.filter(
      (product: any) => product?.status === undefined || product.status === "active",
    );
    const legacyMatch = activeProducts[Number(legacyPosition) - 1] ?? null;
    return legacyMatch
      ? normalizeCommerceProduct(serialize(legacyMatch))
      : null;
  } catch (error) {
    console.error(`Error in getSingleProduct for id: ${id}`, error);
    return null;
  }
});

export const getTenantRegistry = cache(async () => {
  try {
    return serialize(brandingFromPublicSite(await fetchPublicSitePage("home")));
  } catch (error) {
    console.error("Error reading public branding contract:", error);
    return null;
  }
});

export const getBusinessBlueprint = cache(async () => {
  try {
    return serialize(blueprintFromPublicSite(await fetchPublicSitePage("home")));
  } catch (error) {
    console.error("Error reading public Business Blueprint projection:", error);
    return null;
  }
});
