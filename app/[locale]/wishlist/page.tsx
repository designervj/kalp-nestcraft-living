import { Metadata } from "next";
import WishlistPageClient from "./_components/WishlistPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "My Wishlist | NestCraft Living",
    description:
      "View and manage the products you've saved to your wishlist. Save your favorite furniture pieces for later.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `https://nestcraftliving.com/${locale}/wishlist`,
    },
    openGraph: {
      title: "My Wishlist | NestCraft Living",
      description:
        "View and manage the products you've saved to your wishlist.",
      url: `https://nestcraftliving.com/${locale}/wishlist`,
      siteName: "NestCraft Living",
      locale: locale === "hi" ? "hi_IN" : "en_US",
      type: "website",
    },
  };
}

export default function WishlistPage() {
  return <WishlistPageClient />;
}
