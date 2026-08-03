import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  blueprintFromPublicSite,
  fetchPublicSitePage,
  normalizePublicPage,
} from "@/lib/public-site";

const originalTenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG;
const originalApiBase = process.env.FASTAPI_URL;

afterEach(() => {
  vi.unstubAllGlobals();
  process.env.NEXT_PUBLIC_TENANT_SLUG = originalTenantSlug;
  process.env.FASTAPI_URL = originalApiBase;
});

describe("governed public Page authority", () => {
  it("uses the public publishing contract without database-selection headers", async () => {
    process.env.NEXT_PUBLIC_TENANT_SLUG = "nestcraft";
    process.env.FASTAPI_URL = "http://business-core.invalid";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          tenant_slug: "nestcraft",
          business_label: "NestCraft",
          public_theme: { colors: { primary: "#111" } },
          public_navigation: [],
          vocabulary: {},
          page: {
            page_slug: "about",
            title: "About NestCraft",
            blocks: [{ id: "story", type: "content", props: {} }],
            status: "published",
            seo_description: "Our story",
          },
          discovery: {},
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const envelope = await fetchPublicSitePage("about");
    const [url, options] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe(
      "http://business-core.invalid/publishing/public/nestcraft/site?page_slug=about",
    );
    expect(options.headers).toEqual({ Accept: "application/json" });
    expect(JSON.stringify(options)).not.toContain("x-tenant-db");

    const page = normalizePublicPage(envelope);
    expect(page?.slug).toBe("about");
    expect(page?.isPublished).toBe(true);
    expect(page?.content).toEqual([{ id: "story", type: "content", props: {} }]);
    expect(page?.metaDescription?.en).toBe("Our story");
    expect(blueprintFromPublicSite(envelope)?.document_key).toBe(
      "public-site-contract",
    );
  });

  it("does not let the global storefront loader replace governed Page content", () => {
    const source = readFileSync(resolve("components/pages/FetchAllData.tsx"), "utf8");
    expect(source).not.toContain("GetAllPages");
    expect(source).not.toContain("UpdateCurrentPage");
  });

  it("fails before fetch when the configured public tenant slug is invalid", async () => {
    process.env.NEXT_PUBLIC_TENANT_SLUG = "../../database";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchPublicSitePage("home")).rejects.toThrow(
      "public tenant slug is invalid",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
