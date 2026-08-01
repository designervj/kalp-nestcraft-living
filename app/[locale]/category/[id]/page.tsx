import { Metadata } from "next";
import { Suspense } from "react";
import Component from "@/components/pages/CategoryPage";
import GetProductCategoryWise from "@/lib/GetAllDetails/GetProductCategoryWise";
import PageLoader from "@/components/pages/PageLoader";
import { getCmsPageMetadata } from "@/lib/cms/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getCmsPageMetadata({
    slug: "category",
    locale,
    fallbackTitle: "Category | NestCraft Living",
    fallbackDescription: "Browse furniture by category at NestCraft Living.",
  });
}

export default function CatPage() {
  return (
    <Suspense fallback={<PageLoader text="Loading Category" />}>
      <GetProductCategoryWise />
      <Component />
    </Suspense>
  );
}
