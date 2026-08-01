import { Metadata } from "next";
import OrderDetailsPageClient from "./_components/OrderDetailsPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;

  return {
    title: `Order Details | NestCraft Living`,
    description: "View the details of your order including items, pricing, and shipping information.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `https://nestcraftliving.com/${locale}/orders/${id}`,
    },
    openGraph: {
      title: `Order Details | NestCraft Living`,
      description: "View the details of your order including items, pricing, and shipping information.",
      url: `https://nestcraftliving.com/${locale}/orders/${id}`,
      siteName: "NestCraft Living",
      locale: locale === "hi" ? "hi_IN" : "en_US",
      type: "website",
    },
  };
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailsPageClient id={id} />;
}
