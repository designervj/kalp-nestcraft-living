import { describe, expect, it } from "vitest";

import { projectOrder } from "@/lib/services/orders";

describe("Nestcraft authoritative Order projection", () => {
  it("adapts canonical COD Order, Invoice and fulfilment fields without losing identity", () => {
    const order = projectOrder({
      id: "order-1",
      orderNumber: "ORD-0001",
      status: "placed",
      paymentStatus: "pending",
      fulfillmentStatus: "processing",
      paymentMethod: "cod",
      currency: "INR",
      subtotal_minor: 250000,
      discount_minor: 25000,
      shipping_minor: 0,
      tax_minor: 40500,
      total_minor: 265500,
      invoice_number: "INV-0001",
      invoice_issued_at: "2026-08-03T10:00:00Z",
      email: "buyer@example.test",
      shippingAddress: {
        firstName: "Kalp",
        lastName: "Buyer",
        address1: "1 Studio Road",
        city: "Delhi",
        state: "Delhi",
        postalCode: "110001",
        countryCode: "IN",
        phone: "9999999999",
      },
      items: [{
        orderLineId: "canonical-line-1",
        productId: "product-1",
        name: "Canonical bowl",
        sku: "BOWL-1",
        quantity: 2,
        unitPriceMinor: 125000,
      }],
      createdAt: "2026-08-03T09:59:00Z",
      updatedAt: "2026-08-03T10:01:00Z",
    });

    expect(order.id).toBe("order-1");
    expect(order.payment).toEqual(expect.objectContaining({ method: "cod", paymentStatus: "pending" }));
    expect(order.fulfillmentStatus).toBe("processing");
    expect(order.pricing).toEqual({ subtotal: 2500, discount: 250, shipping: 0, tax: 405, total: 2655 });
    expect(order.items[0]).toEqual(expect.objectContaining({ productId: "product-1", quantity: 2, price: 1250 }));
    expect(order.shippingAddress).toEqual(expect.objectContaining({
      email: "buyer@example.test",
      addressLine1: "1 Studio Road",
      zipCode: "110001",
      country: "IN",
    }));
    expect(order.invoiceNumber).toBe("INV-0001");
  });

  it("preserves the legacy presentation contract during staged migration", () => {
    const order = projectOrder({
      id: "legacy-1",
      items: [{ productId: "p1", name: "Legacy", slug: "legacy", sku: "L1", quantity: 1, price: 499 }],
      pricing: { subtotal: 499, shipping: 0, discount: 0, tax: 0, total: 499 },
      shippingAddress: { firstName: "A", lastName: "B", email: "a@example.test", phone: "1", addressLine1: "Street", city: "Delhi", state: "Delhi", zipCode: "1", country: "IN" },
      payment: { method: "manual", paymentStatus: "pending" },
      shipping: { method: "local" },
      orderNumber: "LEGACY-1",
      statusHistory: [{ status: "pending", timestamp: "2026-08-03T00:00:00Z" }],
      createdAt: "2026-08-03T00:00:00Z",
      updatedAt: "2026-08-03T00:00:00Z",
    });

    expect(order.pricing.total).toBe(499);
    expect(order.items[0].price).toBe(499);
    expect(order.payment.method).toBe("manual");
  });
});
