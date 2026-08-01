import { Metadata } from 'next';
import Component from '@/components/pages/FAQPage';
import { getPageData } from '@/lib/getPageData';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const data = await getPageData('faq');
  return {
    title: data?.metaTitle?.[locale] || data?.metaTitle?.en || "FAQ | NestCraft Living",
    description: data?.metaDescription?.[locale] || data?.metaDescription?.en || "Frequently asked questions about NestCraft furniture, shipping, returns, and more.",
    robots: { index: true, follow: true },
  };
}

export default async function Page() {
  const pageData = await getPageData('faq');
  return <Component initialData={pageData} />;
}
