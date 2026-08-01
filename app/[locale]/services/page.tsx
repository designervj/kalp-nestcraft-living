import { Metadata } from "next";
import { getPageData } from "@/lib/getPageData";
import Component from '@/components/pages/ServicesPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const data = await getPageData("services");
  return {
    title: data?.metaTitle?.[locale] || data?.metaTitle?.en || "Services | NestCraft Living",
    description: data?.metaDescription?.[locale] || data?.metaDescription?.en || "Explore our interior design services, custom furniture consultations, and home styling solutions at NestCraft Living.",
    robots: { index: true, follow: true },
  };
}

export default function Page() {
  return <Component />;
}
