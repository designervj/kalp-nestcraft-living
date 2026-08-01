import Component from "@/components/pages/ProductDetailPage";
import { getSingleProduct } from "@/lib/getPageData";
import { resolveProductImage } from "@/lib/commerce/product-normalization";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getSingleProduct(id);

  if (!product) {
    return { title: "Product Not Found | NestCraft Living" };
  }

  const description = product.description
    ? product.description.replace(/<[^>]*>/g, "").substring(0, 160)
    : `${product.name} — Shop online at NestCraft Living.`;

  const primaryImage = resolveProductImage(product);

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: primaryImage ? [{ url: primaryImage, width: 1200, height: 630 }] : [],
      type: "website",
      siteName: "NestCraft Living",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://nestcraft.com/product/${product.slug || id}`,
    },
  };
}

export default async function ProdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getSingleProduct(id);

  if (!product) {
    return <div>Product not found</div>;
  }
  return (
    <>
      <Component currentProduct={product} />
    </>
  );
}
