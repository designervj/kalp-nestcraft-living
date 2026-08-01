import { Metadata } from "next";
import { getCmsPageMetadata } from "@/lib/cms/page-metadata";
import { Suspense } from 'react';
import Component from '@/components/pages/CategoryPage';
import GetAllPages from '@/components/pages/GetAllPages';
import GetAllMenus from '@/components/cms/menus/GetAllMenus';
import GetProductCategoryWise from '@/lib/GetAllDetails/GetProductCategoryWise';
import PageLoader from '@/components/pages/PageLoader';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getCmsPageMetadata({
    slug: "shop",
    locale,
    fallbackTitle: "Shop Furniture | NestCraft Living",
    fallbackDescription: "Browse our curated collection of premium handcrafted furniture for every room.",
  });
}

export default function Page() {
  return (
    <Suspense fallback={<PageLoader text="Loading Shop" />}>
      <GetAllPages />
      <GetAllMenus />
      <GetProductCategoryWise />
      <Component />
    </Suspense>
  );
}
