import { Metadata } from "next";
import Component from "@/components/pages/CheckoutPage";

export const metadata: Metadata = {
  title: "Checkout | NestCraft Living",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Component />;
}
