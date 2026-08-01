import { beforeEach, describe, expect, it, vi } from "vitest";
import { getNetworkAttemptCount } from "../setup/network-guard";

const orderMocks = vi.hoisted(() => ({
  authenticateAdmin: vi.fn(),
  getOrderModel: vi.fn(),
  find: vi.fn(),
  sort: vi.fn(),
  toArray: vi.fn(),
  findOneAndUpdate: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authenticateAdmin: orderMocks.authenticateAdmin,
}));

vi.mock("@/models", () => ({
  getOrderModel: orderMocks.getOrderModel,
}));

describe("local order integrity characterization", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    orderMocks.authenticateAdmin.mockResolvedValue({
      role: "characterized-admin",
    });
    orderMocks.find.mockReturnValue({ sort: orderMocks.sort });
    orderMocks.sort.mockReturnValue({ toArray: orderMocks.toArray });
    orderMocks.toArray.mockResolvedValue([]);
    orderMocks.getOrderModel.mockResolvedValue({
      find: orderMocks.find,
      findOneAndUpdate: orderMocks.findOneAndUpdate,
    });
  });

  it("has no local order-creation or customer order-detail handler", async () => {
    const orderCollectionRoute = await import(
      "@/app/api/ecommerce/orders/route"
    );
    const orderItemRoute = await import(
      "@/app/api/ecommerce/orders/[id]/route"
    );

    expect(
      (orderCollectionRoute as Record<string, unknown>).POST,
    ).toBeUndefined();
    expect((orderItemRoute as Record<string, unknown>).GET).toBeUndefined();
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("lists orders for an admin and ignores a supplied user ownership filter", async () => {
    const { GET } = await import("@/app/api/ecommerce/orders/route");
    const response = await GET(
      new Request(
        "http://localhost/api/ecommerce/orders?user_id=user-symbolic",
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
    expect(orderMocks.find).toHaveBeenCalledWith({});
    expect(orderMocks.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("accepts an arbitrary admin-submitted order status without a transition rule", async () => {
    const returnedOrder = {
      _id: "507f1f77bcf86cd799439011",
      status: "symbolic-unconstrained-status",
    };
    orderMocks.findOneAndUpdate.mockResolvedValue(returnedOrder);

    const { PUT } = await import("@/app/api/ecommerce/orders/[id]/route");
    const response = await PUT(
      new Request(
        "http://localhost/api/ecommerce/orders/507f1f77bcf86cd799439011",
        {
          method: "PUT",
          body: JSON.stringify({
            status: "symbolic-unconstrained-status",
            shippingAddress: { marker: "client-authored-address" },
          }),
          headers: { "content-type": "application/json" },
        },
      ),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      message: "Order updated",
      order: returnedOrder,
    });
    const update = orderMocks.findOneAndUpdate.mock.calls[0][1];
    expect(update.$set).toMatchObject({
      status: "symbolic-unconstrained-status",
      shippingAddress: { marker: "client-authored-address" },
    });
    expect(getNetworkAttemptCount()).toBe(0);
  });

  it("rejects local order reads and mutations before model access when admin auth fails", async () => {
    orderMocks.authenticateAdmin.mockResolvedValue(null);
    const collectionRoute = await import("@/app/api/ecommerce/orders/route");
    const itemRoute = await import("@/app/api/ecommerce/orders/[id]/route");

    const listResponse = await collectionRoute.GET(
      new Request("http://localhost/api/ecommerce/orders"),
    );
    const updateResponse = await itemRoute.PUT(
      new Request(
        "http://localhost/api/ecommerce/orders/507f1f77bcf86cd799439011",
        {
          method: "PUT",
          body: JSON.stringify({ status: "symbolic" }),
          headers: { "content-type": "application/json" },
        },
      ),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) },
    );

    expect(listResponse.status).toBe(401);
    expect(updateResponse.status).toBe(401);
    expect(orderMocks.getOrderModel).not.toHaveBeenCalled();
    expect(getNetworkAttemptCount()).toBe(0);
  });
});
