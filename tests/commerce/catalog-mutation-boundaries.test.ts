import fs from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNetworkAttemptCount } from "../setup/network-guard";

const boundaryMocks = vi.hoisted(() => ({
  authorizeCommerceAdmin: vi.fn(),
  connectTenantDB: vi.fn(),
  getProductModel: vi.fn(),
  getVariantModel: vi.fn(),
  proxyRequest: vi.fn(),
}));

vi.mock("@/lib/commerce-admin", () => ({
  authorizeCommerceAdmin: boundaryMocks.authorizeCommerceAdmin,
}));

vi.mock("@/lib/db", () => ({
  connectTenantDB: boundaryMocks.connectTenantDB,
}));

vi.mock("@/models", () => ({
  getProductModel: boundaryMocks.getProductModel,
  getVariantModel: boundaryMocks.getVariantModel,
}));

vi.mock("@/lib/apiProxy", () => ({
  proxyRequest: boundaryMocks.proxyRequest,
}));

type MutationInvocation = {
  label: string;
  invoke: () => Promise<Response>;
};

function request(pathname: string, method: string) {
  return new NextRequest(`http://localhost${pathname}`, {
    method,
    headers: { "content-type": "application/json" },
    body: method === "DELETE" ? undefined : JSON.stringify({}),
  });
}

async function localMutationInvocations(): Promise<MutationInvocation[]> {
  const attributes = await import("@/app/api/ecommerce/attributes/route");
  const attributeBulk = await import(
    "@/app/api/ecommerce/attributes/bulk/route"
  );
  const categories = await import("@/app/api/ecommerce/categories/route");
  const categoryBulk = await import(
    "@/app/api/ecommerce/categories/bulk/route"
  );
  const products = await import("@/app/api/ecommerce/products/route");
  const productBulk = await import("@/app/api/ecommerce/products/bulk/route");
  const productItem = await import("@/app/api/ecommerce/products/[id]/route");
  const upload = await import("@/app/api/ecommerce/upload/route");
  const itemContext = {
    params: Promise.resolve({ id: "symbolic-product" }),
  };

  return [
    {
      label: "POST attributes",
      invoke: () =>
        attributes.POST(request("/api/ecommerce/attributes", "POST")),
    },
    {
      label: "PUT attributes",
      invoke: () =>
        attributes.PUT(request("/api/ecommerce/attributes", "PUT")),
    },
    {
      label: "DELETE attributes",
      invoke: () =>
        attributes.DELETE(request("/api/ecommerce/attributes", "DELETE")),
    },
    {
      label: "POST attribute bulk",
      invoke: () =>
        attributeBulk.POST(request("/api/ecommerce/attributes/bulk", "POST")),
    },
    {
      label: "POST categories",
      invoke: () =>
        categories.POST(request("/api/ecommerce/categories", "POST")),
    },
    {
      label: "PUT categories",
      invoke: () =>
        categories.PUT(request("/api/ecommerce/categories", "PUT")),
    },
    {
      label: "DELETE categories",
      invoke: () =>
        categories.DELETE(request("/api/ecommerce/categories", "DELETE")),
    },
    {
      label: "POST category bulk",
      invoke: () =>
        categoryBulk.POST(request("/api/ecommerce/categories/bulk", "POST")),
    },
    {
      label: "POST products",
      invoke: () => products.POST(request("/api/ecommerce/products", "POST")),
    },
    {
      label: "PUT products",
      invoke: () => products.PUT(request("/api/ecommerce/products", "PUT")),
    },
    {
      label: "DELETE products",
      invoke: () =>
        products.DELETE(request("/api/ecommerce/products", "DELETE")),
    },
    {
      label: "POST product bulk",
      invoke: () =>
        productBulk.POST(request("/api/ecommerce/products/bulk", "POST")),
    },
    {
      label: "PUT product item",
      invoke: () =>
        productItem.PUT(
          request("/api/ecommerce/products/symbolic-product", "PUT"),
          itemContext,
        ),
    },
    {
      label: "DELETE product item",
      invoke: () =>
        productItem.DELETE(
          request("/api/ecommerce/products/symbolic-product", "DELETE"),
          itemContext,
        ),
    },
    {
      label: "POST upload",
      invoke: () => upload.POST(request("/api/ecommerce/upload", "POST")),
    },
  ];
}

describe("catalog mutation boundaries", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    boundaryMocks.authorizeCommerceAdmin.mockImplementation(async () => ({
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      ),
    }));
  });

  it("rejects every local catalog mutation before database, write, or network access", async () => {
    const invocations = await localMutationInvocations();

    for (const invocation of invocations) {
      const response = await invocation.invoke();
      expect(response.status, invocation.label).toBe(401);
      expect(await response.json(), invocation.label).toEqual({
        error: "Unauthorized",
      });
    }

    expect(boundaryMocks.connectTenantDB).not.toHaveBeenCalled();
    expect(boundaryMocks.getProductModel).not.toHaveBeenCalled();
    expect(boundaryMocks.getVariantModel).not.toHaveBeenCalled();
    expect(boundaryMocks.proxyRequest).not.toHaveBeenCalled();
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it.each([
    ["POST", "products"],
    ["PUT", "products/symbolic-product"],
    ["DELETE", "categories/symbolic-category"],
    ["PATCH", "attributes/symbolic-attribute"],
    ["POST", "attribute-sets/bulk"],
    ["POST", "variants"],
    ["POST", "upload"],
  ])(
    "rejects proxied %s commerce/%s before forwarding",
    async (method, resource) => {
      const route = await import("@/app/api/[[...slug]]/route");
      const handler = route[method as "POST" | "PUT" | "DELETE" | "PATCH"];
      const response = await handler(
        request(`/api/commerce/${resource}`, method),
        {
          params: Promise.resolve({
            slug: ["commerce", ...resource.split("/")],
          }),
        },
      );

      expect(response.status).toBe(401);
      expect(boundaryMocks.proxyRequest).not.toHaveBeenCalled();
      expect(boundaryMocks.connectTenantDB).not.toHaveBeenCalled();
      expect(getNetworkAttemptCount()).toBe(0);
    },
  );

  it("allows an approved admin mutation to reach only the intended proxy", async () => {
    boundaryMocks.authorizeCommerceAdmin.mockResolvedValue({
      authorized: true,
      principal: { role: "admin" },
    });
    boundaryMocks.proxyRequest.mockResolvedValue(
      NextResponse.json({ success: true, data: { id: "symbolic" } }),
    );

    const route = await import("@/app/api/[[...slug]]/route");
    const incoming = request("/api/commerce/products", "POST");
    const response = await route.POST(incoming, {
      params: Promise.resolve({ slug: ["commerce", "products"] }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: { id: "symbolic" },
    });
    expect(boundaryMocks.proxyRequest).toHaveBeenCalledOnce();
    expect(boundaryMocks.proxyRequest).toHaveBeenCalledWith(
      incoming,
      "commerce/products",
      { addApiPrefix: false },
    );
    expect(boundaryMocks.connectTenantDB).not.toHaveBeenCalled();
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("contains browser catalog mutations behind same-origin commerce routes", () => {
    const categorySource = fs.readFileSync(
      "lib/store/categories/categoriesThunk.ts",
      "utf8",
    );
    const attributeSource = fs.readFileSync(
      "lib/store/attributes/attributesThunk.ts",
      "utf8",
    );

    expect(categorySource).not.toContain("NEXT_PUBLIC_API_BASE_URL");
    expect(attributeSource).not.toContain("NEXT_PUBLIC_API_BASE_URL");
    expect(categorySource).not.toMatch(/\$\{API_BASE_URL\}\/commerce\//);
    expect(attributeSource).not.toMatch(/\$\{API_BASE_URL\}\/commerce\//);
    expect(categorySource).toContain('fetch("/api/commerce/categories"');
    expect(categorySource).toContain(
      'fetch("/api/commerce/categories/bulk"',
    );
    expect(attributeSource).toContain(
      'fetch("/api/commerce/attributes"',
    );
    expect(getNetworkAttemptCount()).toBe(0);
  });
});
