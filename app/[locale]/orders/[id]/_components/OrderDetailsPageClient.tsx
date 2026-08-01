"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchOrderById } from "@/lib/store/orders/ordersThunk";
import { clearSelectedOrder } from "@/lib/store/orders/ordersSlice";
import { getOrderId } from "@/lib/services/orders";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ArrowLeft,
  Package,
  Calendar,
  CreditCard,
  User,
  MapPin,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";

export default function OrderDetailsPageClient({
  id,
}: {
  id: string;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { user, isAuthenticated, isLoading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  const { selectedOrder, loading: orderLoading, error } = useSelector(
    (state: RootState) => state.orders,
  );

  // Authenticate page
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && id) {
      dispatch(fetchOrderById(id));
    }

    return () => {
      dispatch(clearSelectedOrder());
    };
  }, [dispatch, isAuthenticated, id]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const getOrderStatus = (): string => {
    if (!selectedOrder) return "";
    if ((selectedOrder as any).status) return (selectedOrder as any).status;
    if (selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0) {
      return selectedOrder.statusHistory[selectedOrder.statusHistory.length - 1].status;
    }
    return "pending";
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string }> = {
      pending: { bg: "bg-amber-50 text-amber-700 border-amber-200" },
      processing: { bg: "bg-blue-50 text-blue-700 border-blue-200" },
      shipped: { bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      delivered: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      cancelled: { bg: "bg-rose-50 text-rose-700 border-rose-200" },
      unfulfilled: { bg: "bg-slate-50 text-slate-700 border-slate-200" },
    };

    const s = status.toLowerCase();
    const config = statusMap[s] || { bg: "bg-slate-50 text-slate-700 border-slate-200" };

    return (
      <span
        className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${config.bg}`}
      >
        Status: {status}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusMap: Record<string, { bg: string }> = {
      pending: { bg: "bg-amber-50 text-amber-700 border-amber-200" },
      captured: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      paid: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      failed: { bg: "bg-rose-50 text-rose-700 border-rose-200" },
    };

    const s = paymentStatus.toLowerCase();
    const config = statusMap[s] || { bg: "bg-slate-50 text-slate-700 border-slate-200" };

    return (
      <span
        className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${config.bg}`}
      >
        Payment: {paymentStatus}
      </span>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-8 animate-pulse">
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="h-6 w-36 bg-border rounded"></div>
        <div className="h-8 w-64 bg-border rounded"></div>
        <div className="h-4 w-48 bg-border rounded"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-3xl p-6 h-44 bg-border/20"></div>
        <div className="bg-surface border border-border rounded-3xl p-6 h-44 bg-border/20"></div>
      </div>
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="h-6 w-32 bg-border rounded"></div>
        <div className="h-20 bg-border rounded"></div>
        <div className="h-20 bg-border rounded"></div>
      </div>
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="pb-24 pt-12 px-[5%] max-w-5xl mx-auto min-h-[80vh]">
      {/* BREADCRUMBS */}
      <div className="crumbs flex items-center gap-2 mb-8 text-sm font-bold text-muted">
        <Link href="/" className="hover:text-secondary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="opacity-50" />
        <Link href="/orders" className="hover:text-secondary transition-colors">
          Orders
        </Link>
        <ChevronRight size={12} className="opacity-50" />
        <strong className="text-foreground">Order Details</strong>
      </div>

      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary transition-colors mb-6 uppercase tracking-wider"
      >
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      {orderLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 mx-auto text-rose-600">
            <AlertCircle size={28} />
          </div>
          <h3 className="text-lg font-bold text-rose-900 mb-2">
            Failed to load order
          </h3>
          <p className="text-sm font-semibold text-rose-700 mb-6">{error}</p>
          <button
            onClick={() => dispatch(fetchOrderById(id))}
            className="inline-flex items-center justify-center bg-rose-600 text-white px-8 h-12 rounded-full text-[13px] font-bold uppercase tracking-wider hover:bg-rose-700 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : selectedOrder ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Order Banner Info */}
          <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5 mb-5">
              <div>
                <span className="text-[11px] font-black text-muted uppercase tracking-wider">
                  Order Reference
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-0.5">
                  {selectedOrder.orderNumber}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {getPaymentStatusBadge(selectedOrder.payment.paymentStatus)}
                {getStatusBadge(getOrderStatus())}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-wider">
                    Placed On
                  </p>
                  <p className="font-bold text-foreground text-sm mt-0.5">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                  <Package size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-wider">
                    Order ID
                  </p>
                  <p
                    className="font-bold text-foreground text-sm mt-0.5 truncate max-w-[200px]"
                    title={getOrderId(selectedOrder)}
                  >
                    {getOrderId(selectedOrder)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-wider">
                    Payment Method
                  </p>
                  <p className="font-bold text-foreground text-sm mt-0.5 uppercase">
                    {selectedOrder.payment.method}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer and Shipping details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8">
              <h3 className="text-lg font-bold tracking-tight mb-5 flex items-center gap-2 border-b border-border pb-3">
                <User size={18} className="text-secondary" /> Customer Info
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-muted uppercase tracking-wider">
                    Full Name
                  </p>
                  <p className="font-bold text-foreground text-sm mt-0.5">
                    {selectedOrder.shippingAddress.firstName}{" "}
                    {selectedOrder.shippingAddress.lastName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-secondary shrink-0" />
                  <span className="font-semibold text-muted text-sm truncate">
                    {selectedOrder.shippingAddress.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-secondary shrink-0" />
                  <span className="font-bold text-foreground text-sm">
                    {selectedOrder.shippingAddress.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8">
              <h3 className="text-lg font-bold tracking-tight mb-5 flex items-center gap-2 border-b border-border pb-3">
                <MapPin size={18} className="text-secondary" /> Shipping Address
              </h3>
              <div className="text-sm font-semibold text-muted space-y-1">
                <p className="font-bold text-foreground mb-1">
                  {selectedOrder.shippingAddress.firstName}{" "}
                  {selectedOrder.shippingAddress.lastName}
                </p>
                <p>{selectedOrder.shippingAddress.addressLine1}</p>
                {selectedOrder.shippingAddress.addressLine2 && (
                  <p>{selectedOrder.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {selectedOrder.shippingAddress.city},{" "}
                  {selectedOrder.shippingAddress.state} -{" "}
                  {selectedOrder.shippingAddress.zipCode}
                </p>
                <p>{selectedOrder.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Ordered Products list */}
          <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-bold tracking-tight mb-6 flex items-center gap-2 border-b border-border pb-4">
              <Package size={18} className="text-secondary" /> Ordered Items
            </h3>

            <div className="space-y-5">
              {selectedOrder.items.map((item, index) => (
                <div
                  key={item.variantId || item.productId || index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-20 bg-background border border-border rounded-xl overflow-hidden shrink-0">
                      <img
                        src={item.image || "/assets/Image/Sofa.jpg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/assets/Image/Sofa.jpg";
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      {item.slug ? (
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-bold text-foreground hover:text-secondary transition-colors text-sm sm:text-base line-clamp-1"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <p className="font-bold text-foreground text-sm sm:text-base line-clamp-1">
                          {item.name}
                        </p>
                      )}
                      {item.variantTitle && (
                        <p className="text-xs font-semibold text-muted mt-0.5">
                          Variant: {item.variantTitle}
                        </p>
                      )}
                      <p className="text-[10px] font-black text-muted uppercase tracking-wider mt-1">
                        SKU: {item.sku}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-12 w-full sm:w-auto shrink-0 border-t border-border/50 sm:border-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Qty
                      </p>
                      <p className="font-bold text-foreground text-sm sm:text-base mt-0.5">
                        {item.quantity}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Unit Price
                      </p>
                      <p className="font-bold text-foreground text-sm sm:text-base mt-0.5">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Total
                      </p>
                      <p className="font-black text-secondary text-sm sm:text-base mt-0.5">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 max-w-md ml-auto">
            <h3 className="text-lg font-bold tracking-tight mb-5 border-b border-border pb-3">
              Order Summary
            </h3>
            <div className="space-y-3 font-semibold text-sm">
              <div className="flex justify-between items-center text-muted">
                <span>Subtotal</span>
                <span>{formatPrice(selectedOrder.pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-muted">
                <span>Shipping</span>
                <span>
                  {selectedOrder.pricing.shipping === 0
                    ? "Free"
                    : formatPrice(selectedOrder.pricing.shipping)}
                </span>
              </div>
              <div className="flex justify-between items-center text-muted">
                <span>Tax</span>
                <span>{formatPrice(selectedOrder.pricing.tax)}</span>
              </div>
              {selectedOrder.pricing.discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>-{formatPrice(selectedOrder.pricing.discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-border pt-4 text-base font-black">
                <span className="text-foreground">Total</span>
                <span className="text-secondary text-lg">
                  {formatPrice(selectedOrder.pricing.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-surface border border-border rounded-3xl max-w-lg mx-auto">
          <AlertCircle size={40} className="text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">Order not found</h3>
          <p className="text-sm font-semibold text-muted mb-6">
            The requested order details are not available.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center justify-center bg-primary text-white px-8 h-12 rounded-full text-[13px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-all"
          >
            Back to Orders
          </Link>
        </div>
      )}
    </div>
  );
}
