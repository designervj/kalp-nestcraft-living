import type { Metadata } from "next";
import { getPageData } from "@/lib/getPageData";

function localized(value: unknown, locale: string): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const translations = value as Record<string, unknown>;
  const selected = translations[locale] ?? translations.en;
  return typeof selected === "string" ? selected : "";
}

export async function getCmsPageMetadata({
  slug,
  locale = "en",
  fallbackTitle,
  fallbackDescription,
  index = true,
}: {
  slug: string;
  locale?: string;
  fallbackTitle: string;
  fallbackDescription?: string;
  index?: boolean;
}): Promise<Metadata> {
  const page = await getPageData(slug);
  const title =
    localized(page?.metaTitle, locale) ||
    localized(page?.seo?.title, locale) ||
    fallbackTitle;
  const description =
    localized(page?.metaDescription, locale) ||
    localized(page?.seo?.description, locale) ||
    fallbackDescription;

  return {
    title,
    description,
    openGraph: description ? { title, description } : { title },
    robots: { index, follow: index },
  };
}
