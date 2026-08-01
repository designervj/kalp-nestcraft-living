type CommerceRecord = Record<string, any>;

function finiteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function resolveCommercePrice(product: CommerceRecord): number {
  const minor = finiteNumber(product.unitPriceMinor);
  if (minor !== null && Number.isInteger(minor) && minor >= 0) {
    return minor / 100;
  }

  const direct = finiteNumber(product.price);
  const nested = finiteNumber(product.pricing?.price);
  if (direct === 0 && nested !== null && nested > 0) return nested;
  if (direct !== null && direct >= 0) return direct;
  if (nested !== null && nested >= 0) return nested;
  return 0;
}

export function resolveCompareAtPrice(product: CommerceRecord): number | null {
  const minor = finiteNumber(product.compareAtPriceMinor);
  const candidate =
    minor !== null && Number.isInteger(minor) && minor >= 0
      ? minor / 100
      : finiteNumber(product.pricing?.compareAtPrice ?? product.compareAtPrice);
  const current = resolveCommercePrice(product);
  return candidate !== null && candidate > current ? candidate : null;
}

export function normalizeCommerceProduct<T extends CommerceRecord>(product: T): T {
  const price = resolveCommercePrice(product);
  const compareAtPrice = resolveCompareAtPrice(product);
  return {
    ...product,
    price,
    currency: product.currency || product.pricing?.currency || "INR",
    pricing: {
      ...(product.pricing || {}),
      price,
      compareAtPrice,
    },
  };
}

export function formatCommercePrice(value: unknown, currency = "INR"): string {
  const amount = Math.max(0, finiteNumber(value) ?? 0);
  const hasFraction = !Number.isInteger(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(amount);
}

export function resolveProductImage(product: CommerceRecord): string {
  const galleryUrl = product.gallery?.find((item: CommerceRecord) => item?.url)?.url;
  if (galleryUrl) return galleryUrl;

  const categories = Array.isArray(product.categorySlugs)
    ? product.categorySlugs.map(String)
    : [];
  if (categories.some((value: string) => value.includes("bed"))) {
    return "/assets/Image/matterss.jpeg";
  }
  if (categories.some((value: string) => value.includes("dinning") || value.includes("dining"))) {
    return "/assets/Image/dining.jpeg";
  }
  if (categories.some((value: string) => value.includes("office") || value.includes("study"))) {
    return "/assets/Image/study.jpeg";
  }
  if (categories.some((value: string) => value.includes("storage") || value.includes("cabinate"))) {
    return "/assets/Image/storage.jpg";
  }
  if (categories.some((value: string) => value.includes("decor") || value.includes("lifestyle"))) {
    return "/assets/Image/decor.jpg";
  }
  return "/assets/Image/Sofa.jpg";
}

export function resolveCategoryImage(category: CommerceRecord): string {
  const provided =
    category.bannerImageUrl || category.banner?.url || category.image?.url || category.image;
  if (typeof provided === "string" && provided.trim()) return provided;

  const key = String(category.slug || category.name || category.title || "").toLowerCase();
  if (key.includes("mattress") || key.includes("bed")) return "/assets/Image/matterss.jpeg";
  if (key.includes("dining")) return "/assets/Image/dining.jpeg";
  if (key.includes("study") || key.includes("office")) return "/assets/Image/study.jpeg";
  if (key.includes("storage") || key.includes("wardrobe")) return "/assets/Image/storage.jpg";
  if (key.includes("decor")) return "/assets/Image/decor.jpg";
  return "/assets/Image/Sofa.jpg";
}
