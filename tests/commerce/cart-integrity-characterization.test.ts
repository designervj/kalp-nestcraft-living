import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNetworkAttemptCount } from "../setup/network-guard";

const cartMocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  getCartModel: vi.fn(),
  jwtVerify: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cartMocks.cookies,
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: cartMocks.jwtVerify,
  },
}));

vi.mock("@/models", () => ({
  getCartModel: cartMocks.getCartModel,
}));

vi.mock("@/lib/db", () => ({
  connectTenantDB: vi.fn(() => {
    throw new Error("Direct database access is disabled in tests");
  }),
}));

function configureCookies(options?: { userToken?: string; sessionId?: string }) {
  const values = new Map<string, { value: string }>();
  if (options?.userToken) {
    values.set("kalp_session", { value: options.userToken });
  }
  values.set("cart_session_id", {
    value: options?.sessionId || "guest-session-symbolic",
  });

  cartMocks.cookies.mockResolvedValue({
    get: vi.fn((name: string) => values.get(name)),
    set: vi.fn(),
  });
}

describe("local cart integrity characterization", () => {
  beforeEach(() => {
    delete process.env.JWT_SECRET;
    vi.resetModules();
    vi.clearAllMocks();
    configureCookies();
  });

  it("persists and returns client-supplied product, variant, price, discount, and total fields", async () => {
    const insertOne = vi.fn().mockResolvedValue({ insertedId: "cart-symbolic" });
    const findOne = vi.fn().mockResolvedValue(null);
    cartMocks.getCartModel.mockResolvedValue({ findOne, insertOne });

    const submittedItem = {
      cartItemId: "line-symbolic",
      id: "product-symbolic",
      status: "unpublished",
      quantity: 2,
      price: 7,
      discount: 91,
      subtotal: 14,
      total: 1,
      selectedVariant: {
        id: "variant-symbolic",
        status: "inactive",
        stock: 0,
        price: 7,
      },
    };

    const { POST } = await import("@/app/api/ecommerce/cart/route");
    const response = await POST(
      new NextRequest("http://localhost/api/ecommerce/cart", {
        method: "POST",
        body: JSON.stringify(submittedItem),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Item added to cart",
      data: [submittedItem],
      status: 200,
    });
    expect(insertOne).toHaveBeenCalledTimes(1);
    expect(insertOne.mock.calls[0][0].items).toEqual([submittedItem]);
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it.each([
    ["negative", -3],
    ["fractional", 1.5],
    ["excessive", 1_000_000_000],
    ["non-numeric", "not-a-number"],
  ])("persists a %s quantity without validation", async (_label, quantity) => {
    const updateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
    cartMocks.getCartModel.mockResolvedValue({
      findOne: vi.fn().mockResolvedValue({
        sessionId: "guest-session-symbolic",
        items: [{ cartItemId: "line-symbolic", quantity: 1 }],
      }),
      updateOne,
    });

    const { PUT } = await import("@/app/api/ecommerce/cart/route");
    const response = await PUT(
      new NextRequest("http://localhost/api/ecommerce/cart", {
        method: "PUT",
        body: JSON.stringify({ cartItemId: "line-symbolic", quantity }),
        headers: { "content-type": "application/json" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data[0].quantity).toBe(quantity);
    expect(updateOne.mock.calls[0][1].$set.items[0].quantity).toBe(quantity);
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("treats exactly numeric zero as item removal", async () => {
    const updateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
    cartMocks.getCartModel.mockResolvedValue({
      findOne: vi.fn().mockResolvedValue({
        sessionId: "guest-session-symbolic",
        items: [{ cartItemId: "line-symbolic", quantity: 1 }],
      }),
      updateOne,
    });

    const { PUT } = await import("@/app/api/ecommerce/cart/route");
    const response = await PUT(
      new NextRequest("http://localhost/api/ecommerce/cart", {
        method: "PUT",
        body: JSON.stringify({ cartItemId: "line-symbolic", quantity: 0 }),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(200);
    expect((await response.json()).data).toEqual([]);
    expect(updateOne.mock.calls[0][1].$set.items).toEqual([]);
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("uses possession of the guest cart cookie as the ownership selector", async () => {
    configureCookies({ sessionId: "guest-owner-symbolic" });
    const findOne = vi.fn().mockResolvedValue({ items: [] });
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    cartMocks.getCartModel.mockResolvedValue({ findOne });

    try {
      const { GET } = await import("@/app/api/ecommerce/cart/route");
      const response = await GET();

      expect(response.status).toBe(200);
      expect(findOne).toHaveBeenCalledWith({
        sessionId: "guest-owner-symbolic",
      });
      expect(getNetworkAttemptCount()).toBe(0);
    } finally {
      consoleLog.mockRestore();
    }
  });

  it("derives authenticated cart ownership only from the verified userId claim", async () => {
    process.env.JWT_SECRET = randomBytes(32).toString("hex");
    configureCookies({
      userToken: "opaque-user-token",
      sessionId: "guest-session-symbolic",
    });
    cartMocks.jwtVerify.mockReturnValue({ userId: "507f1f77bcf86cd799439011" });
    const findOne = vi
      .fn()
      .mockResolvedValueOnce({ items: [] })
      .mockResolvedValueOnce({ items: [] });
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    cartMocks.getCartModel.mockResolvedValue({ findOne });

    try {
      const { GET } = await import("@/app/api/ecommerce/cart/route");
      const response = await GET();

      expect(response.status).toBe(200);
      expect(findOne).toHaveBeenCalledTimes(2);
      expect(findOne.mock.calls[0][0]).toEqual({
        sessionId: "guest-session-symbolic",
      });
      expect(findOne.mock.calls[1][0].userId.toString()).toBe(
        "507f1f77bcf86cd799439011",
      );
      expect(getNetworkAttemptCount()).toBe(0);
    } finally {
      consoleLog.mockRestore();
    }
  });

  it("calculates the storefront subtotal from client-held cart prices", async () => {
    const { selectCartTotal } = await import("@/lib/store/cart/cartSlice");
    const state = {
      cart: {
        items: [
          {
            quantity: 3,
            price: "2",
            selectedVariant: { price: "11" },
          },
          {
            quantity: -2,
            price: "5",
            selectedVariant: null,
          },
        ],
      },
    };

    expect(selectCartTotal(state as never)).toBe(23);
    expect(getNetworkAttemptCount()).toBe(0);
  });
});
