import { cache } from "react";
import { normalizeCommerceProduct } from "./commerce/product-normalization";
import {
  blueprintFromPublicSite,
  brandingFromPublicSite,
  fetchPublicSitePage,
  normalizePublicPage,
} from "./public-site";
import { MongoClient } from "mongodb";

function adminApiCandidates(): string[] {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "https://zero.kalptree.xyz";
  return [
    ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5177"]),
    adminUrl,
    configuredApiUrl,
  ].filter(Boolean) as string[];
}

async function getBusinessBlueprintFromAdmin() {
  const tenantDb = process.env.NEXT_PUBLIC_TENANT_ID || process.env.DB_NAME || "kp_nestcraft";
  const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || tenantDb.replace(/^kalp_tenant_/, "") || "nestcraft";

  for (const apiUrl of adminApiCandidates()) {
    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/cms/business-blueprint`, {
        headers: {
          "x-tenant-db": tenantDb,
          "tenant-slug": tenantSlug,
          "x-tenant-slug": tenantSlug,
        },
        cache: "no-store",
      });
      if (!response.ok) continue;

      const body = await response.json();
      const payload = body?.data?.payload || body?.data || body;
      if (payload) {
        return serialize({
          id: `admin:${tenantDb}`,
          document_key: "admin-business-blueprint",
          payload,
        });
      }
    } catch {
      continue;
    }
  }

  return null;
}

function serialize(obj: any): any {
  if (obj === null || obj === undefined) return null;
  return JSON.parse(
    JSON.stringify(obj, (_, value) => {
      return value;
    }),
  );
}

export const getPageData = async (slug: string) => {
  try {
    try {
      const { getPageModel } = await import("@/models");
      const PageModel = await getPageModel();
      const data = await PageModel.findOne({ slug });
      if (data?.content) {
        return serialize(data);
      }
    } catch (e) {
      console.warn("Tenant site_pages fetch failed, falling back to public site fetch", e);
    }
    
    return serialize(normalizePublicPage(await fetchPublicSitePage(slug)));
  } catch (error) {
    console.error(`Error in getPageData for slug: ${slug}`, error);
    return null;
  }
};

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
    let res: Response | null = null;
    try {
      res = await fetch(
        `${SITE_URL}/api/commerce/products/slug/${encodeURIComponent(id)}`,
        requestOptions,
      );
      if (res.status === 404) {
        res = await fetch(
          `${SITE_URL}/api/commerce/products/${encodeURIComponent(id)}`,
          requestOptions,
        );
      }
    } catch (error) {
      console.warn(
        `Storefront product lookup failed for id: ${id}; trying Business Core directly`,
        error,
      );
    }

    if (res?.ok) {
      const json = await res.json();
      const data = json?.data !== undefined ? json.data : json;
      if (data) return normalizeCommerceProduct(serialize(data));
    }

    // Business Core currently resolves canonical IDs at the detail endpoint,
    // while public cards and search results use slugs. Resolve those read-only
    // identifiers against the authoritative catalog when detail returns null or 404.
    let catalogResponse: Response | null = null;
    try {
      catalogResponse = await fetch(
        `${SITE_URL}/api/commerce/products`,
        requestOptions,
      );
    } catch (error) {
      console.warn(
        "Storefront catalog lookup failed; trying Business Core directly",
        error,
      );
    }

    if (!catalogResponse?.ok) {
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
    const adminBlueprint = await getBusinessBlueprintFromAdmin();
    if (adminBlueprint) return adminBlueprint;

    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME;
    if (uri && dbName) {
      const client = new MongoClient(uri);
      try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection("business_blueprints");
        const doc =
          (await collection.findOne({ document_key: "blueprint" })) ||
          (await collection.findOne({}));
        if (doc) {
          return serialize({
            id: `public:${dbName}`,
            document_key: "public-site-contract",
            payload: doc.payload || doc // Use doc.payload if it exists, otherwise doc
          });
        }
      } catch (err) {
        console.error("Direct MongoDB fetch failed for business_blueprints:", err);
      } finally {
        await client.close();
      }
    }
    return serialize(blueprintFromPublicSite(await fetchPublicSitePage("home")));
  } catch (error) {
    console.error("Error reading public Business Blueprint projection:", error);
    return null;
  }
});
