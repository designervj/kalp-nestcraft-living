import { Metadata } from 'next';
import { getPageData } from '@/lib/getPageData';
import { getAuthUser } from '@/lib/getSingleUser';
import { cookies } from 'next/headers';
import EcommercePageServer from '@/components/ecommerce/EcommercePageServer';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  // Fallback to local data if API fails, but usually getPageData handles it
  const data = await getPageData("ecommerce");

  return {
    title: data?.metaTitle?.[locale] || data?.metaTitle?.en || "Ecommerce | NestCraft",
    description: data?.metaDescription?.[locale] || data?.metaDescription?.en || "Shop premium handcrafted furniture at NestCraft.",
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // We attempt to fetch page data. In this specific project context,
  // getPageData likely looks into the DB or local JSON files.
  const [data, user] = await Promise.all([
    getPageData("ecommerce"),
    token ? getAuthUser(token).catch(() => null) : Promise.resolve(null),
  ]);

  return <EcommercePageServer data={data} user={user} />;
}
