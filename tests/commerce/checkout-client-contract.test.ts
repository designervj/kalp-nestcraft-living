import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCheckoutOrder,
  createCheckoutPaymentIntent,
  createCheckoutQuote,
  toCheckoutAddress,
} from "@/lib/commerce/checkout-client";
import { getNetworkAttemptCount } from "../setup/network-guard";

describe("Nestcraft authoritative checkout client", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("maps the existing address form to the strict checkout contract", () => {
    expect(
      toCheckoutAddress(
        {
          firstName: " Nest ", lastName: " Craft ", phone: "9999999999",
          addressLine1: "1 Studio Road", addressLine2: "", city: "Delhi",
          state: "Delhi", zipCode: "110001", country: "India",
        },
        { India: "IN" },
      ),
    ).toEqual({
      firstName: "Nest", lastName: "Craft", phone: "9999999999",
      address1: "1 Studio Road", city: "Delhi", state: "Delhi",
      postalCode: "110001", countryCode: "IN",
    });
  });

  it("sends no browser-authored money and preserves idempotency headers", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ data: { id: "quote-1", checksum: "a".repeat(64) } }))
      .mockResolvedValueOnce(Response.json({ data: { id: "order-1", total_minor: 125000 } }, { status: 201 }))
      .mockResolvedValueOnce(Response.json({ data: { id: "intent-1", amountMinor: 125000 } }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const address = toCheckoutAddress({
      firstName: "Nest", lastName: "Craft", phone: "9999999999",
      addressLine1: "1 Studio Road", city: "Delhi", state: "Delhi",
      zipCode: "110001", country: "India",
    }, { India: "IN" });
    const quote = await createCheckoutQuote({ tenantId: "nestcraft", email: "buyer@example.com", shippingAddress: address });
    const order = await createCheckoutOrder({ tenantId: "nestcraft", quoteId: quote.id, quoteChecksum: quote.checksum, paymentMethod: "cod", idempotencyKey: "order-key-0001" });
    await createCheckoutPaymentIntent({ tenantId: "nestcraft", orderId: order.id, provider: "cod", idempotencyKey: "payment-key-0001" });

    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      "/api/commerce/checkout/quotes",
      "/api/commerce/checkout/orders",
      "/api/commerce/checkout/payment-intents",
    ]);
    const bodies = fetchMock.mock.calls.map((call) => JSON.parse(String((call[1] as RequestInit).body)));
    expect(JSON.stringify(bodies)).not.toMatch(/subtotal|discount|tax|shippingMinor|totalMinor|price/i);
    expect((fetchMock.mock.calls[1][1] as RequestInit).headers).toMatchObject({ "Idempotency-Key": "order-key-0001" });
    expect((fetchMock.mock.calls[2][1] as RequestInit).headers).toMatchObject({ "Idempotency-Key": "payment-key-0001" });
    expect(getNetworkAttemptCount()).toBe(0);
  });
});
