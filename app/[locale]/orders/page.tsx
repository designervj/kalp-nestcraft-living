import { Metadata } from "next";
import OrdersPageClient from "./_components/OrdersPageClient";

export const metadata: Metadata = {
  title: "My Orders | NestCraft Living",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
