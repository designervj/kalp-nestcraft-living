import { Metadata } from "next";
import { getPageData } from "@/lib/getPageData";
import Component from '@/components/pages/BlogPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const data = await getPageData("blog");
  return {
    title: data?.metaTitle?.[locale] || data?.metaTitle?.en || "Blog | NestCraft Living",
    description: data?.metaDescription?.[locale] || data?.metaDescription?.en || "Discover interior design inspiration, furniture care tips, and style guides from NestCraft Living.",
    robots: { index: true, follow: true },
  };
}

export default function Page() {
  return <Component />;
}
