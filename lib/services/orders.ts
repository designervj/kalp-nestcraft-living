export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  quantity: number;
  price: number;
  compareAtPrice?: number;
  variantId?: string;
  variantTitle?: string;
  selectedOptions?: Record<string, string>;
  image?: string;
}

export interface OrderPricing {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderPayment {
  transactionId?: string;
  method: string;
  paymentGatewayResponse?: any;
  paidAt?: string;
  paymentStatus: string;
}

export interface OrderStatusHistory {
  status: string;
  timestamp: string;
}

export interface Order {
  _id?: string;
  items: OrderItem[];
  pricing: OrderPricing;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  payment: OrderPayment;
  shipping: {
    method: string;
  };
  currency: string;
  fulfillmentStatus: string;
  orderNumber: string;
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
  id?: string;
  status?: string;
  invoiceNumber?: string;
  invoiceIssuedAt?: string;
}

const tenantHeader = process.env.NEXT_PUBLIC_TENANT_ID;

/**
 * Utility function to extract the string ID from an order item
 */
export const getOrderId = (order: Order): string => {
  if (!order) return "";
  return order.id || "";
};

type UnknownRecord = Record<string, any>;

const record = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

const value = (...candidates: unknown[]): string => {
  const selected = candidates.find((candidate) => typeof candidate === "string" && candidate.trim());
  return typeof selected === "string" ? selected.trim() : "";
};

const amount = (candidate: unknown): number => {
  const parsed = typeof candidate === "number" ? candidate : Number(candidate);
  return Number.isFinite(parsed) ? parsed : 0;
};

const fromMinor = (candidate: unknown): number => amount(candidate) / 100;

/**
 * Projects the authoritative Business Core Order contract into Nestcraft's
 * existing presentation model. Canonical identities and lifecycle state stay
 * authoritative; only field names and minor currency units are adapted.
 */
export function projectOrder(source: unknown): Order {
  const order = record(source);
  const legacyPricing = record(order.pricing);
  const sourceAddress = record(order.shippingAddress);
  const sourceBillingAddress = record(order.billingAddress || order.shippingAddress);
  const sourcePayment = record(order.payment);
  const sourceShipping = record(order.shipping);

  const address = (candidate: UnknownRecord): OrderAddress => ({
    firstName: value(candidate.firstName),
    lastName: value(candidate.lastName),
    email: value(candidate.email, order.email),
    phone: value(candidate.phone),
    addressLine1: value(candidate.addressLine1, candidate.address1),
    addressLine2: value(candidate.addressLine2, candidate.address2) || undefined,
    city: value(candidate.city),
    state: value(candidate.state),
    zipCode: value(candidate.zipCode, candidate.postalCode),
    country: value(candidate.country, candidate.countryCode),
  });

  const rawItems = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.lines)
      ? order.lines
      : [];
  const items: OrderItem[] = rawItems.map((raw: unknown) => {
    const item = record(raw);
    return {
      productId: value(item.productId, item.product_id),
      name: value(item.name, item.title, item.label, item.sku) || "Order item",
      slug: value(item.slug),
      sku: value(item.sku),
      quantity: amount(item.quantity),
      price: item.unitPriceMinor !== undefined
        ? fromMinor(item.unitPriceMinor)
        : item.unit_price_minor !== undefined
          ? fromMinor(item.unit_price_minor)
          : amount(item.price ?? item.unitPrice),
      ...(item.compareAtPrice !== undefined ? { compareAtPrice: amount(item.compareAtPrice) } : {}),
      ...(value(item.variantId, item.variant_id) ? { variantId: value(item.variantId, item.variant_id) } : {}),
      ...(value(item.variantTitle) ? { variantTitle: value(item.variantTitle) } : {}),
      ...(record(item.selectedOptions) ? { selectedOptions: record(item.selectedOptions) as Record<string, string> } : {}),
      ...(value(item.image) ? { image: value(item.image) } : {}),
    };
  });

  const status = value(order.status) || "pending";
  const createdAt = value(order.createdAt, order.created_at, order.placed_at);
  const updatedAt = value(order.updatedAt, order.updated_at, createdAt);
  const statusHistory = Array.isArray(order.statusHistory)
    ? order.statusHistory
    : [{ status, timestamp: createdAt }];

  return {
    id: value(order.id, order._id),
    items,
    pricing: Object.keys(legacyPricing).length
      ? {
          subtotal: amount(legacyPricing.subtotal),
          shipping: amount(legacyPricing.shipping),
          discount: amount(legacyPricing.discount),
          tax: amount(legacyPricing.tax),
          total: amount(legacyPricing.total),
        }
      : {
          subtotal: fromMinor(order.subtotal_minor),
          shipping: fromMinor(order.shipping_minor),
          discount: fromMinor(order.discount_minor),
          tax: fromMinor(order.tax_minor),
          total: fromMinor(order.total_minor),
        },
    shippingAddress: address(sourceAddress),
    billingAddress: address(sourceBillingAddress),
    payment: {
      transactionId: value(sourcePayment.transactionId, sourcePayment.reference) || undefined,
      method: value(sourcePayment.method, order.paymentMethod) || "not recorded",
      paymentGatewayResponse: sourcePayment.paymentGatewayResponse,
      paidAt: value(sourcePayment.paidAt) || undefined,
      paymentStatus: value(sourcePayment.paymentStatus, order.paymentStatus, order.payment_status) || "pending",
    },
    shipping: { method: value(sourceShipping.method, order.shippingMethod) || "not recorded" },
    currency: value(order.currency) || "INR",
    fulfillmentStatus: value(order.fulfillmentStatus, order.fulfillment_status) || "unfulfilled",
    orderNumber: value(order.orderNumber, order.order_number) || value(order.id, order._id),
    statusHistory,
    createdAt,
    updatedAt,
    status,
    invoiceNumber: value(order.invoice_number, order.invoiceNumber) || undefined,
    invoiceIssuedAt: value(order.invoice_issued_at, order.invoiceIssuedAt) || undefined,
  };
}

/**
 * Fetch all orders for the currently logged-in user
 */
export async function getOrders(userId?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (userId) {
    params.append("user_id", userId);
  }
  const response = await fetch(`/api/commerce/orders?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-db": tenantHeader || "",
    },
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to fetch orders");
  }

  // Expect an array of orders directly or under a data field
  const orders = Array.isArray(data) ? data : data.data || [];
  return Array.isArray(orders) ? orders.map(projectOrder) : [];
}

/**
 * Fetch a single order by ID
 */
export async function getOrderById(id: string): Promise<Order> {
  const response = await fetch(`/api/commerce/orders/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-db": tenantHeader || "",
    },
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to fetch order");
  }

  return projectOrder(data.data || data);
}
