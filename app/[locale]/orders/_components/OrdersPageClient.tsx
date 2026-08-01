"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchOrders } from "@/lib/store/orders/ordersThunk";
import { getOrderId, Order } from "@/lib/services/orders";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  Calendar,
  CreditCard,
  AlertCircle,
} from "lucide-react";

export default function OrdersPageClient() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useSelector((state: RootState) => state.auth);

  const {
    orders,
    loading: ordersLoading,
    error,
  } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchOrders({ userId: user.id }));
    }
  }, [dispatch, isAuthenticated]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
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

  const getOrderStatus = (order: Order): string => {
    if ((order as any).status) return (order as any).status;
    if (order.statusHistory && order.statusHistory.length > 0) {
      return order.statusHistory[order.statusHistory.length - 1].status;
    }
    return "pending";
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { bg: string; text: string; border: string }
    > = {
      pending: {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        text: "text-amber-700",
        border: "border-amber-200",
      },
      processing: {
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        text: "text-blue-700",
        border: "border-blue-200",
      },
      shipped: {
        bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        text: "text-indigo-700",
        border: "border-indigo-200",
      },
      delivered: {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        text: "text-emerald-700",
        border: "border-emerald-200",
      },
      cancelled: {
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        text: "text-rose-700",
        border: "border-rose-200",
      },
      unfulfilled: {
        bg: "bg-slate-50 text-slate-700 border-slate-200",
        text: "text-slate-700",
        border: "border-slate-200",
      },
    };

    const s = status.toLowerCase();
    const config = statusMap[s] || {
      bg: "bg-slate-50 text-slate-700 border-slate-200",
      text: "text-slate-700",
      border: "border-slate-200",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${config.bg} ${config.text} ${config.border}`}
      >
        {status}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusMap: Record<
      string,
      { bg: string; text: string; border: string }
    > = {
      pending: {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        text: "text-amber-700",
        border: "border-amber-200",
      },
      captured: {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        text: "text-emerald-700",
        border: "border-emerald-200",
      },
      paid: {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        text: "text-emerald-700",
        border: "border-emerald-200",
      },
      failed: {
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        text: "text-rose-700",
        border: "border-rose-200",
      },
    };

    const s = paymentStatus.toLowerCase();
    const config = statusMap[s] || {
      bg: "bg-slate-50 text-slate-700 border-slate-200",
      text: "text-slate-700",
      border: "border-slate-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${config.bg} ${config.text} ${config.border}`}
      >
        Payment: {paymentStatus}
      </span>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="bg-surface border border-border rounded-2xl p-6 sm:p-8 animate-pulse space-y-5"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-3">
            <div className="h-6 w-40 bg-border rounded-md"></div>
            <div className="h-6 w-24 bg-border rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-3 w-16 bg-border rounded"></div>
              <div className="h-5 w-28 bg-border rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-border rounded"></div>
              <div className="h-5 w-24 bg-border rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-border rounded"></div>
              <div className="h-5 w-20 bg-border rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-border rounded"></div>
              <div className="h-10 w-28 bg-border rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
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
    <div className="pb-24 pt-12 px-[5%] max-w-7xl mx-auto min-h-[80vh]">
      {/* BREADCRUMBS */}
      <div className="crumbs flex items-center gap-2 mb-8 text-sm font-bold text-muted">
        <Link href="/" className="hover:text-secondary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="opacity-50" />
        <strong className="text-foreground">Orders</strong>
      </div>

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-[42px] md:text-[52px] font-bold tracking-tight leading-none">
            My Orders
          </h1>
          <p className="text-muted font-semibold mt-3 max-w-md">
            View history, track delivery status, and manage invoices for your
            purchases.
          </p>
        </div>

        {orders.length > 0 && (
          <div className="bg-surface border border-border px-5 py-2.5 rounded-full flex items-center gap-2 self-start md:self-auto">
            <span className="text-secondary font-black">{orders.length}</span>
            <span className="text-muted text-[11px] font-black uppercase tracking-wider">
              {orders.length === 1 ? "Order Placed" : "Orders Placed"}
            </span>
          </div>
        )}
      </div>

      {ordersLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 mx-auto text-rose-600">
            <AlertCircle size={28} />
          </div>
          <h3 className="text-lg font-bold text-rose-900 mb-2">
            Failed to load orders
          </h3>
          <p className="text-sm font-semibold text-rose-700 mb-6">{error}</p>
          <button
            onClick={() => dispatch(fetchOrders({ userId: user?.id! }))}
            className="inline-flex items-center justify-center bg-rose-600 text-white px-8 h-12 rounded-full text-[13px] font-bold uppercase tracking-wider hover:bg-rose-700 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const orderId = getOrderId(order);
            const status = getOrderStatus(order);
            const itemsCount = order.items.reduce(
              (acc, item) => acc + item.quantity,
              0,
            );

            return (
              <div
                key={orderId}
                className="group bg-surface border border-border rounded-3xl p-6 sm:p-8 hover:border-secondary/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-border pb-5 mb-5 gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-black text-muted uppercase tracking-wider">
                      Order Reference
                    </span>
                    <h3 className="text-lg font-extrabold text-foreground group-hover:text-secondary transition-colors">
                      {order.orderNumber}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {getPaymentStatusBadge(order.payment.paymentStatus)}
                    {getStatusBadge(status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-end">
                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-black text-muted uppercase tracking-wider">
                      <Calendar size={13} className="text-secondary" /> Date
                      Placed
                    </span>
                    <p className="font-bold text-foreground text-sm sm:text-base">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-black text-muted uppercase tracking-wider">
                      <Package size={13} className="text-secondary" /> Total
                      Items
                    </span>
                    <p className="font-bold text-foreground text-sm sm:text-base">
                      {itemsCount} {itemsCount === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-black text-muted uppercase tracking-wider">
                      <CreditCard size={13} className="text-secondary" /> Total
                      Amount
                    </span>
                    <p className="font-black text-secondary text-base sm:text-lg">
                      {formatPrice(order.pricing.total)}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href={`/orders/${orderId}`}
                      className="inline-flex items-center justify-center bg-primary text-white text-[11px] font-bold tracking-wider uppercase px-6 h-12 rounded-full hover:bg-primary/90 transition-all gap-2 group/btn"
                    >
                      View Details
                      <ArrowRight
                        size={14}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center text-center max-w-lg mx-auto bg-surface border border-border rounded-3xl p-8">
          <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-8 relative text-secondary">
            <ShoppingBag size={40} className="opacity-80" />
            <Package
              size={20}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-bounce"
            />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            No orders found
          </h2>
          <p className="text-muted font-semibold mb-10 leading-relaxed max-w-sm">
            Start shopping and place your first order.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-primary text-white text-[13px] font-bold tracking-wider uppercase px-12 h-14 rounded-full hover:bg-primary/90 transition-all shadow-md active:scale-95"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
