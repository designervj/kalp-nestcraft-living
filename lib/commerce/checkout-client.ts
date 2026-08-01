export type StorefrontAddress = {
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
  email?: unknown;
  addressLine1?: unknown;
  addressLine2?: unknown;
  city?: unknown;
  state?: unknown;
  zipCode?: unknown;
  country?: unknown;
};

export type CheckoutAddress = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  countryCode: string;
  phone: string;
};

type ApiEnvelope<T> = { data: T; detail?: string };

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function toCheckoutAddress(
  address: StorefrontAddress,
  countryCodes: Record<string, string>,
): CheckoutAddress {
  const country = text(address.country) || "India";
  return {
    firstName: text(address.firstName),
    lastName: text(address.lastName),
    address1: text(address.addressLine1),
    ...(text(address.addressLine2)
      ? { address2: text(address.addressLine2) }
      : {}),
    city: text(address.city),
    ...(text(address.state) ? { state: text(address.state) } : {}),
    postalCode: text(address.zipCode),
    countryCode: countryCodes[country] || country.toUpperCase().slice(0, 2),
    phone: text(address.phone),
  };
}

async function readApi<T>(response: Response, fallback: string): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as Partial<
    ApiEnvelope<T>
  >;
  if (!response.ok || !body.data) {
    throw new Error(body.detail || fallback);
  }
  return body.data;
}

export async function createCheckoutQuote(input: {
  tenantId?: string;
  email: string;
  shippingAddress: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  couponCode?: string;
}) {
  const response = await fetch("/api/commerce/checkout/quotes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-db": input.tenantId || "",
    },
    credentials: "include",
    body: JSON.stringify({
      email: input.email,
      shippingAddress: input.shippingAddress,
      ...(input.billingAddress
        ? { billingAddress: input.billingAddress }
        : {}),
      ...(input.couponCode ? { couponCode: input.couponCode } : {}),
    }),
  });
  return readApi<any>(response, "Unable to calculate a secure checkout quote.");
}

export async function createCheckoutOrder(input: {
  tenantId?: string;
  quoteId: string;
  quoteChecksum: string;
  paymentMethod: string;
  idempotencyKey: string;
}) {
  const response = await fetch("/api/commerce/checkout/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-db": input.tenantId || "",
      "Idempotency-Key": input.idempotencyKey,
    },
    credentials: "include",
    body: JSON.stringify({
      quoteId: input.quoteId,
      quoteChecksum: input.quoteChecksum,
      paymentMethod: input.paymentMethod,
    }),
  });
  return readApi<any>(response, "Unable to create the order safely.");
}

export async function createCheckoutPaymentIntent(input: {
  tenantId?: string;
  orderId: string;
  provider: string;
  idempotencyKey: string;
}) {
  const response = await fetch("/api/commerce/checkout/payment-intents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-db": input.tenantId || "",
      "Idempotency-Key": input.idempotencyKey,
    },
    credentials: "include",
    body: JSON.stringify({ orderId: input.orderId, provider: input.provider }),
  });
  return readApi<any>(response, "Unable to initialize the payment safely.");
}
