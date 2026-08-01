import { describe, expect, it } from "vitest";
import {
  formatCommercePrice,
  normalizeCommerceProduct,
  resolveCommercePrice,
} from "@/lib/commerce/product-normalization";

describe("commerce product normalization", () => {
  it("keeps a positive root price authoritative over a conflicting nested price", () => {
    expect(resolveCommercePrice({ price: 23_999, pricing: { price: 70_000 } })).toBe(23_999);
  });

  it("uses a positive nested price when the legacy root price is zero", () => {
    expect(resolveCommercePrice({ price: 0, pricing: { price: 200 } })).toBe(200);
  });

  it("converts the future minor-unit contract to display units", () => {
    expect(resolveCommercePrice({ unitPriceMinor: 129_900 })).toBe(1_299);
  });

  it("removes an invalid compare-at value below the selling price", () => {
    const product = normalizeCommerceProduct({
      price: 1_000,
      pricing: { compareAtPrice: 111 },
    });

    expect(product.pricing.compareAtPrice).toBeNull();
  });

  it("formats current catalog values in the deployment currency", () => {
    expect(formatCommercePrice(48_000, "INR")).toBe("₹48,000");
  });
});
