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
  if (key.includes("mattress") || key.includes("bed")) return "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200";
  if (key.includes("dinning") || key.includes("dining")) return "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&q=80&w=1200";
  if (key.includes("study") || key.includes("office")) return "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200";
  if (key.includes("storage") || key.includes("wardrobe") || key.includes("cabinet")) return "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=1200";
  if (key.includes("decor")) return "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200";
  if (key.includes("kitchen")) return "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=1200";
  if (key.includes("living")) return "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200";
  
  return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200";
}
