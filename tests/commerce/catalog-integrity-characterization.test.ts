import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNetworkAttemptCount } from "../setup/network-guard";

const catalogMocks = vi.hoisted(() => ({
  authorizeCommerceAdmin: vi.fn(),
  connectTenantDB: vi.fn(),
  aggregate: vi.fn(),
  aggregateToArray: vi.fn(),
  productInsertOne: vi.fn(),
  variantInsertMany: vi.fn(),
  attributeFind: vi.fn(),
  attributeToArray: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  connectTenantDB: catalogMocks.connectTenantDB,
}));

vi.mock("@/lib/commerce-admin", () => ({
  authorizeCommerceAdmin: catalogMocks.authorizeCommerceAdmin,
}));

function configureDatabase() {
  const products = {
    aggregate: catalogMocks.aggregate,
    insertOne: catalogMocks.productInsertOne,
  };
  const variants = {
    insertMany: catalogMocks.variantInsertMany,
  };
  const attributeSets = {
    find: catalogMocks.attributeFind,
  };
  catalogMocks.connectTenantDB.mockResolvedValue({
    collection: vi.fn((name: string) => {
      if (name === "products") return products;
      if (name === "variants") return variants;
      if (name === "attribute_sets") return attributeSets;
      throw new Error(`Unexpected symbolic collection: ${name}`);
    }),
  });
  catalogMocks.aggregate.mockReturnValue({
    toArray: catalogMocks.aggregateToArray,
  });
  catalogMocks.attributeFind.mockReturnValue({
    toArray: catalogMocks.attributeToArray,
  });
  catalogMocks.productInsertOne.mockResolvedValue({
    insertedId: "product-record-symbolic",
  });
  catalogMocks.variantInsertMany.mockResolvedValue({ insertedCount: 0 });
  catalogMocks.attributeToArray.mockResolvedValue([]);
}

describe("local catalog integrity characterization", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    configureDatabase();
    catalogMocks.authorizeCommerceAdmin.mockResolvedValue({
      authorized: true,
      principal: { role: "admin" },
    });
  });

  it("returns unpublished products and unavailable variants when no status filter is requested", async () => {
    const product = {
      _id: "product-symbolic",
      status: "draft",
      pricing: { price: "19" },
      variants: [
        {
          _id: "variant-symbolic",
          status: "inactive",
          stock: 0,
          price: "19",
        },
      ],
    };
    catalogMocks.aggregateToArray.mockResolvedValue([product]);

    const { GET } = await import("@/app/api/ecommerce/products/route");
    const response = await GET(
      new NextRequest("http://localhost/api/ecommerce/products"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Products fetched successfully",
      data: [product],
    });
    const pipeline = catalogMocks.aggregate.mock.calls[0][0];
    expect(pipeline[0]).toEqual({ $match: {} });
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("preserves client-authored product and variant financial behavior after admin authorization", async () => {
    const submittedProduct = {
      name: "Symbolic product",
      sku: "SYMBOLIC-SKU",
      status: "active",
      pricing: {
        price: "-12",
        compareAtPrice: "999",
        costPerItem: "1",
        chargeTax: false,
        trackQuantity: false,
      },
      variants: [
        {
          sku: "SYMBOLIC-VARIANT",
          price: "-4",
          stock: "-9",
          status: "inactive",
        },
      ],
    };

    const { POST } = await import("@/app/api/ecommerce/products/route");
    const response = await POST(
      new NextRequest("http://localhost/api/ecommerce/products", {
        method: "POST",
        body: JSON.stringify(submittedProduct),
        headers: { "content-type": "application/json" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Product created successfully");
    expect(catalogMocks.productInsertOne.mock.calls[0][0]).toMatchObject({
      name: submittedProduct.name,
      pricing: submittedProduct.pricing,
      status: submittedProduct.status,
    });
    expect(catalogMocks.variantInsertMany.mock.calls[0][0][0]).toMatchObject(
      submittedProduct.variants[0],
    );
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("preserves the local bulk product success shape after admin authorization", async () => {
    const submitted = {
      name: "Bulk symbolic product",
      sku: "BULK-SYMBOLIC",
      attributeSetIds: [],
      options: [],
      variants: [
        {
          sku: "BULK-SYMBOLIC-VARIANT",
          price: "3",
          stock: "0",
        },
      ],
    };

    const { POST } = await import(
      "@/app/api/ecommerce/products/bulk/route"
    );
    const response = await POST(
      new NextRequest("http://localhost/api/ecommerce/products/bulk", {
        method: "POST",
        body: JSON.stringify([submitted]),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(200);
    expect(catalogMocks.productInsertOne).toHaveBeenCalledTimes(1);
    expect(catalogMocks.variantInsertMany).toHaveBeenCalledTimes(1);
    expect(getNetworkAttemptCount()).toBe(0);
  });
});
