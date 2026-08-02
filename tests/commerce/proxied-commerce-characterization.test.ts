import fs from "node:fs";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNetworkAttemptCount } from "../setup/network-guard";

const SERVER_DATABASE = "commerce_authority_symbolic";
const CLIENT_DATABASE = "client_selector_symbolic";

function jsonResponse(body: unknown) {
  return Response.json(body, { status: 200 });
}

describe("proxied commerce characterization", () => {
  beforeEach(() => {
    process.env.DB_NAME = SERVER_DATABASE;
    process.env.NEXT_PUBLIC_TENANT_ID = CLIENT_DATABASE;
    process.env.NEXT_PUBLIC_TENANT_DB_NAME = CLIENT_DATABASE;
    vi.resetModules();
  });

  it("forwards client-authored cart identity, quantity, and price without local revalidation", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ accepted: true }));
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.stubGlobal("fetch", fetchMock);
    const submitted = {
      productId: "product-symbolic",
      variantId: "variant-symbolic",
      quantity: -4.5,
      price: -20,
      status: "unpublished",
      inventory: 0,
    };

    try {
      const { proxyRequest } = await import("@/lib/apiProxy");
      const response = await proxyRequest(
        new NextRequest("http://localhost/api/commerce/cart", {
          method: "POST",
          body: JSON.stringify(submitted),
          headers: {
            "content-type": "application/json",
            "x-tenant-db": CLIENT_DATABASE,
          },
        }),
        "commerce/cart",
      );

      expect(response.status).toBe(200);
      const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;
      expect(JSON.parse(String(requestOptions.body))).toEqual(submitted);
      const headers = requestOptions.headers as Headers;
      expect(headers.get("x-tenant-db")).toBe(SERVER_DATABASE);
      expect(headers.get("x-tenant-db")).not.toBe(CLIENT_DATABASE);
      expect(getNetworkAttemptCount()).toBe(0);
    } finally {
      consoleLog.mockRestore();
    }
  });

  it("forwards client-calculated order prices, discounts, taxes, shipping, and totals unchanged", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ accepted: true }));
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.stubGlobal("fetch", fetchMock);
    const submitted = {
      items: [
        {
          productId: "product-symbolic",
          variantId: "variant-symbolic",
          quantity: 2,
          price: 1,
        },
      ],
      pricing: {
        subtotal: 2,
        discount: 500,
        tax: -10,
        shipping: -20,
        total: 0,
      },
      statusHistory: [{ status: "pending", timestamp: null }],
    };

    try {
      const { proxyRequest } = await import("@/lib/apiProxy");
      const response = await proxyRequest(
        new NextRequest("http://localhost/api/commerce/orders", {
          method: "POST",
          body: JSON.stringify(submitted),
          headers: { "content-type": "application/json" },
        }),
        "commerce/orders",
      );

      expect(response.status).toBe(200);
      const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;
      expect(JSON.parse(String(requestOptions.body))).toEqual(submitted);
      expect(getNetworkAttemptCount()).toBe(0);
    } finally {
      consoleLog.mockRestore();
    }
  });

  it("adds no local idempotency key when an identical order request is retried", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ attempt: 1 }))
      .mockResolvedValueOnce(jsonResponse({ attempt: 2 }));
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.stubGlobal("fetch", fetchMock);
    const body = JSON.stringify({
      items: [{ productId: "product-symbolic", quantity: 1, price: 5 }],
      pricing: { total: 5 },
    });

    try {
      const { proxyRequest } = await import("@/lib/apiProxy");
      for (let attempt = 0; attempt < 2; attempt += 1) {
        await proxyRequest(
          new NextRequest("http://localhost/api/commerce/orders", {
            method: "POST",
            body,
            headers: { "content-type": "application/json" },
          }),
          "commerce/orders",
        );
      }

      expect(fetchMock).toHaveBeenCalledTimes(2);
      for (const call of fetchMock.mock.calls) {
        const options = call[1] as RequestInit;
        const headers = options.headers as Headers;
        expect(options.body).toBe(body);
        expect(headers.has("idempotency-key")).toBe(false);
      }
      expect(getNetworkAttemptCount()).toBe(0);
    } finally {
      consoleLog.mockRestore();
    }
  });

  it("preserves the storefront idempotency key for authoritative checkout", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ accepted: true }));
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.stubGlobal("fetch", fetchMock);

    try {
      const { proxyRequest } = await import("@/lib/apiProxy");
      await proxyRequest(
        new NextRequest("http://localhost/api/commerce/checkout/orders", {
          method: "POST",
          body: JSON.stringify({ quoteId: "quote-1", quoteChecksum: "checksum-1", paymentMethod: "cod" }),
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": "nestcraft-order-stable-key",
          },
        }),
        "commerce/checkout/orders",
      );

      const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;
      const headers = requestOptions.headers as Headers;
      expect(headers.get("idempotency-key")).toBe("nestcraft-order-stable-key");
      expect(getNetworkAttemptCount()).toBe(0);
    } finally {
      consoleLog.mockRestore();
    }
  });

  it("uses the authoritative quote and idempotent checkout client from the storefront", () => {
    const source = fs.readFileSync(
      "components/pages/CheckoutPage.tsx",
      "utf8",
    );

    expect(source).toContain("const cartTotal = useAppSelector(selectCartTotal)");
    expect(source).toContain("const totalTax =");
    expect(source).toContain("const shippingCost =");
    expect(source).toContain("const orderTotal = Math.max(");
    expect(source).toContain("createCheckoutQuote({");
    expect(source).toContain("createCheckoutOrder({");
    expect(source).toContain("createCheckoutPaymentIntent({");
    expect(source).not.toContain('fetch("/api/commerce/orders"');
    expect(source).not.toContain("buildOrderPayload");
    expect(getNetworkAttemptCount()).toBe(0);
  });
});
