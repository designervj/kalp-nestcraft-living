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
}

const tenantHeader = process.env.NEXT_PUBLIC_TENANT_ID;

/**
 * Utility function to extract the string ID from an order item
 */
export const getOrderId = (order: Order): string => {
  if (!order) return "";
  return order.id || "";
};

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
  return Array.isArray(data) ? data : data.data || [];
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

  return data.data || data;
}
