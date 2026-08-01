import HomePageServer from "@/components/pages/HomePageServer";
import { Metadata } from "next";
import { getPageData } from "@/lib/getPageData";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const data = await getPageData("home");

  return {
    title: data?.metaTitle?.[locale] || data?.metaTitle?.en  || "NestCraft",
    description: data?.metaDescription?.[locale] || data?.metaDescription?.en || "Sculpting Personal Spaces",
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = await getPageData("home");


  return <HomePageServer data={data} lang={locale} />;
}
