import { afterEach, describe, expect, it, vi } from "vitest";

describe("public product resolution", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("resolves a public slug when the canonical detail endpoint returns null", async () => {
    const product = { id: "product-1", slug: "velvet-sofa", status: "active" };
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: null }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [product] }) }));

    const { getSingleProduct } = await import("@/lib/getPageData");
    await expect(getSingleProduct("velvet-sofa")).resolves.toMatchObject(product);
  });

  it("maps legacy p-N homepage links to active catalog positions", async () => {
    const product = { id: "product-2", slug: "second", status: "active" };
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => null })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        data: [{ id: "product-1", status: "active" }, product],
      }) }));

    const { getSingleProduct } = await import("@/lib/getPageData");
    await expect(getSingleProduct("p-2")).resolves.toMatchObject(product);
  });
});
