import { Metadata } from "next";
import Component from '@/components/pages/CartPage';
import { getCmsPageMetadata } from "@/lib/cms/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getCmsPageMetadata({
    slug: "cart",
    locale,
    fallbackTitle: "Shopping Cart | NestCraft Living",
    fallbackDescription: "Review the products in your NestCraft shopping cart.",
    index: false,
  });
}

export default function Page() {
  return <Component />;
}
