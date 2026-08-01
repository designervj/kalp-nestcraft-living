import { cache } from "react";
import { connectTenantDB } from "./db";
import { ObjectId } from "mongodb";
import { normalizeCommerceProduct } from "./commerce/product-normalization";

function serialize(obj: any): any {
  if (obj === null || obj === undefined) return null;
  return JSON.parse(
    JSON.stringify(obj, (_, value) => {
      if (value instanceof ObjectId) {
        return value.toString();
      }
      return value;
    }),
  );
}

export const getPageData = cache(async (slug: string) => {
  try {
    const db = await connectTenantDB();
    const page = await db.collection("site_pages").findOne({
      slug,
      isPublished: { $ne: false },
    });

    return serialize(page);
  } catch (error) {
    console.error(`Error in getPageData for slug: ${slug}`, error);
    return null;
  }
});

export const getSingleProduct = cache(async (id: string) => {
  const SITE_URL = process.env.SITE_URL || "http://127.0.0.1:3000";
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || "kp_nestcraft";

  try {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-db": tenantId,
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

    if (!res.ok) {
      if (res.status !== 404) {
        console.error(
          `Failed to fetch product data for id: ${id}, status: ${res.status}`,
        );
      } else {
        console.warn(
          `Product data not found for id: ${id} (status: 404)`,
        );
      }
      return null;
    }

    const json = await res.json();
    const data = json.data !== undefined ? json.data : json;

    return normalizeCommerceProduct(serialize(data));
  } catch (error) {
    console.error(`Error in getSingleProduct for id: ${id}`, error);
    return null;
  }
});

export const getTenantRegistry = cache(async () => {
  const db = await connectTenantDB();
  const tenantRegistry = db.collection("tenant_registry");

  const tenant = await tenantRegistry.findOne({ type: "branding" });

  return serialize(tenant);
});

export const getBusinessBlueprint = cache(async () => {
  try {
    const db = await connectTenantDB();
    const blueprint = await db.collection("business_blueprints_v2").findOne({});

    if (!blueprint) return null;

    const serialized = serialize(blueprint);
    const publicExperience = serialized.experience?.public || {};
    const commerce = serialized.verticals?.commerce?.configuration || {};

    // The website consumes a small compatibility view derived exclusively from
    // Blueprint V2. The legacy business_blueprints collection is never read.
    return {
      ...serialized,
      id: serialized._id,
      tenant_slug: serialized.tenant?.slug,
      document_key: "blueprint-v2",
      payload: {
        ...serialized,
        tenant_id: serialized.tenant?.id,
        tenant_slug: serialized.tenant?.slug,
        version: serialized.metadata?.blueprintVersion,
        public_theme: publicExperience.theme,
        brandAssets: publicExperience.theme,
        public_navigation: publicExperience.navigationProfile,
        permalinkDetails: serialized.seo?.permalinks,
        commerce,
      },
    };
  } catch (error) {
    console.error("Error reading Business Blueprint V2:", error);
    return null;
  }
});
