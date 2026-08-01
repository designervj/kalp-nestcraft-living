import AboutPageServer from '@/components/pages/AboutPageServer';
import { getPageData } from '@/lib/getPageData';
import { getAuthUser } from '@/lib/getSingleUser';
import { cookies } from 'next/headers';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const data = await getPageData("about");

  return {
    title: data?.metaTitle?.[locale] || data?.metaTitle?.en || "About Us | NestCraft",
    description: data?.metaDescription?.[locale] || data?.metaDescription?.en || "Learn more about NestCraft craftsmanship.",
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
  const key = `auth_token_${tenantId}`
  const token = cookieStore.get(key)?.value;

  const [data, user] = await Promise.all([
    getPageData("about"),
    token ? getAuthUser(token).catch(() => null) : Promise.resolve(null),
  ]);

  return <AboutPageServer data={data} user={user} />;
}
