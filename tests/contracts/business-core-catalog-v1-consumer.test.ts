import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";

const statusSchema = z.enum(["draft", "active", "archived"]);
const requestIdSchema = z.string().regex(/^[A-Za-z0-9._-]{1,64}$/);
const metaSchema = z
  .object({
    correlation_id: requestIdSchema,
    audit_id: z.string().min(1),
    timestamp: z.string().datetime(),
  })
  .strict();
const moneySchema = {
  currency: z.literal("INR"),
  unitPriceMinor: z.number().int().nonnegative(),
  compareAtPriceMinor: z.number().int().nonnegative().nullable(),
};
const productSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    sku: z.string().nullable(),
    status: statusSchema,
    published: z.boolean(),
    available: z.boolean(),
    ...moneySchema,
    maxPurchaseQuantity: z.number().int().min(1).max(99).nullable(),
    variantRequired: z.boolean(),
    sellable: z.boolean(),
  })
  .strict()
  .superRefine((product, context) => {
    const expected =
      product.status === "active" && product.published && product.available;
    if (product.sellable !== expected) {
      context.addIssue({
        code: "custom",
        message: "Sellable must equal active, published and available",
      });
    }
  });
const variantSchema = z
  .object({
    id: z.string().min(1),
    productId: z.string().min(1),
    sku: z.string().min(1),
    title: z.string().min(1),
    status: statusSchema,
    published: z.boolean(),
    available: z.boolean(),
    ...moneySchema,
    availableStock: z.number().int().nonnegative(),
    maxPurchaseQuantity: z.number().int().min(1).max(99).nullable(),
    sellable: z.boolean(),
  })
  .strict()
  .superRefine((variant, context) => {
    const expected =
      variant.status === "active" &&
      variant.published &&
      variant.available &&
      variant.availableStock > 0;
    if (variant.sellable !== expected) {
      context.addIssue({
        code: "custom",
        message: "Sellable variant must be active, published, available and in stock",
      });
    }
  });
const lookupEnvelope = <T extends z.ZodType>(data: T) =>
  z.object({ data, meta: metaSchema }).strict();
const productListEnvelope = z
  .object({
    data: z.array(productSchema),
    meta: metaSchema,
    page: z
      .object({
        cursor: z.string().min(1).nullable(),
        next_cursor: z.string().min(1).nullable(),
        limit: z.number().int().min(1).max(200),
      })
      .strict(),
  })
  .strict();
const apiErrorSchema = z
  .object({
    code: z.string().min(1),
    message: z.string().min(1),
    correlation_id: requestIdSchema,
    details: z.record(z.string(), z.unknown()),
  })
  .strict();
const validationResponseSchema = z
  .object({
    data: z
      .object({
        product: productSchema,
        variant: variantSchema.nullable(),
        quantity: z
          .object({
            existingQuantity: z.number().int().nonnegative(),
            requestedIncrement: z.number().int().min(1).max(99),
            resultingQuantity: z.number().int().positive(),
            effectiveMaximum: z.number().int().min(0).max(99),
          })
          .strict(),
      })
      .strict(),
    meta: metaSchema,
  })
  .strict();

const fixturePath = resolve(
  "tests/contracts/fixtures/business-core-catalog-v1.json",
);
const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as {
  contractId: string;
  alignmentStatus: string;
  issuer: string;
  audience: string;
  identityRuntimeStatus: string;
  targetNamespace: string;
  providerOpenApiSha256: string;
  providerRuntimeActive: boolean;
  nestcraftRuntimeAdapterActive: boolean;
  productLookup: unknown;
  productList: unknown;
  variantLookup: unknown;
  validationResponse: unknown;
  errorExamples: Array<[number, unknown]>;
  errors: Array<[number, string]>;
  callerMap: Array<[string, string, string, string, string]>;
};

describe("Business Core catalog consumer design contract", () => {
  it("pins the converged design without enabling runtime behavior", () => {
    expect(fixture.contractId).toBe(
      "urn:kalp:business-core:catalog-integration:1.0.0",
    );
    expect(fixture.alignmentStatus).toBe("CONTRACT_CONVERGENCE_READY");
    expect(fixture.issuer).toBe("https://biz.kalptree.xyz");
    expect(fixture.audience).toBe("urn:kalp:business-core-api");
    expect(fixture.targetNamespace).toBe("/v2/integrations/catalog");
    expect(fixture.identityRuntimeStatus).toContain("UNIMPLEMENTED");
    expect(fixture.providerRuntimeActive).toBe(false);
    expect(fixture.nestcraftRuntimeAdapterActive).toBe(false);
  });

  it("pins the provider OpenAPI checksum as consumer contract metadata", () => {
    expect(fixture.providerOpenApiSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("accepts strict product, variant and cursor fixtures", () => {
    expect(
      lookupEnvelope(productSchema).parse(fixture.productLookup),
    ).toBeDefined();
    expect(
      lookupEnvelope(variantSchema).parse(fixture.variantLookup),
    ).toBeDefined();
    expect(productListEnvelope.parse(fixture.productList)).toBeDefined();
  });

  it("rejects unavailable records represented as sellable", () => {
    const lookup = structuredClone(fixture.productLookup) as {
      data: { published: boolean };
    };
    lookup.data.published = false;
    expect(() => lookupEnvelope(productSchema).parse(lookup)).toThrow();
  });

  it("accepts integer INR minor units and rejects floats", () => {
    const product = structuredClone(fixture.productLookup) as {
      data: { unitPriceMinor: number };
    };
    product.data.unitPriceMinor = 1999.5;
    expect(() => lookupEnvelope(productSchema).parse(product)).toThrow();
  });

  it("characterizes resulting-quantity and product-variant rules", () => {
    const validated = validationResponseSchema.parse(
      fixture.validationResponse,
    );
    expect(validated.data.variant?.productId).toBe(validated.data.product.id);
    expect(validated.data.quantity.resultingQuantity).toBe(
      validated.data.quantity.existingQuantity +
        validated.data.quantity.requestedIncrement,
    );
    expect(validated.data.quantity.resultingQuantity).toBeLessThanOrEqual(
      validated.data.quantity.effectiveMaximum,
    );
  });

  it("accepts direct canonical ApiError rejection examples", () => {
    for (const [status, body] of fixture.errorExamples) {
      expect([401, 403]).toContain(status);
      const parsed = apiErrorSchema.parse(body);
      expect(parsed).not.toHaveProperty("error");
    }
  });

  it("pins the complete typed status and error-code pairs", () => {
    expect(fixture.errors).toEqual([
      [401, "AUTHENTICATION_REQUIRED"],
      [401, "SERVICE_TOKEN_INVALID"],
      [403, "PERMISSION_DENIED"],
      [403, "TENANT_SCOPE_FORBIDDEN"],
      [404, "PRODUCT_NOT_FOUND"],
      [404, "VARIANT_NOT_FOUND"],
      [422, "PRODUCT_VARIANT_MISMATCH"],
      [422, "PRODUCT_NOT_AVAILABLE"],
      [422, "VARIANT_NOT_AVAILABLE"],
      [422, "QUANTITY_INVALID"],
      [422, "QUANTITY_LIMIT_EXCEEDED"],
      [409, "INSUFFICIENT_STOCK"],
      [429, "RATE_LIMITED"],
      [503, "SERVICE_UNAVAILABLE"],
      [504, "SERVICE_UNAVAILABLE"],
    ]);
  });

  it("reconciles every mapped caller with an existing source and path", () => {
    for (const [sourcePath, , , pathToken] of fixture.callerMap) {
      const source = readFileSync(resolve(sourcePath), "utf8");
      expect(source).toContain(pathToken);
    }
  });

  it("keeps incompatible resources outside the converged lookup contract", () => {
    const incompatible = fixture.callerMap.filter(
      ([, , , , compatibility]) => compatibility !== "ADAPTER_REQUIRED",
    );
    expect(incompatible.length).toBeGreaterThan(0);
    expect(
      incompatible.some(
        ([, , , , compatibility]) =>
          compatibility === "OUTSIDE_CATALOG_LOOKUP_CONTRACT",
      ),
    ).toBe(true);
  });
});
