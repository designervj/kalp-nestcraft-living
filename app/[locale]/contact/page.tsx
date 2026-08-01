import { Metadata } from "next";
import { getPageData } from "@/lib/getPageData";
import Component from '@/components/pages/ContactPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const data = await getPageData("contact");
  return {
    title: data?.metaTitle?.[locale] || data?.metaTitle?.en || "Contact Us | NestCraft Living",
    description: data?.metaDescription?.[locale] || data?.metaDescription?.en || "Get in touch with NestCraft Living. Visit our showroom in Jaipur or reach out via phone, email, or our contact form.",
    robots: { index: true, follow: true },
  };
}

export default function Page() {
  return <Component />;
}
