import HomePageServer from "@/components/pages/HomePageServer";
import { Metadata } from "next";
import { getPageData } from "@/lib/getPageData";

type PreviewEnvelope = {
  data?: {
    changeSetId: string;
    expiresAt: string;
    page: Record<string, unknown> & { sections?: unknown[] };
    handshake: { pageChecksum: string; themeChecksum: string; renderer: string };
  };
};

async function getStudioPreview(grant?: string) {
  if (!grant) return null;
  const apiBase = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  try {
    const response = await fetch(`${apiBase}/v2/studio/preview?grant=${encodeURIComponent(grant)}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return ((await response.json()) as PreviewEnvelope).data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const data = await getPageData("home");

  return {
    title: data?.metaTitle?.[locale] || data?.metaTitle?.en  || "NestCraft",
    description: data?.metaDescription?.[locale] || data?.metaDescription?.en || "Sculpting Personal Spaces",
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ studioPreviewGrant?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const preview = await getStudioPreview(query.studioPreviewGrant);
  const liveData = preview ? null : await getPageData("home");
  const data = preview ? { ...preview.page, content: preview.page.sections || [] } : liveData;

  return (
    <>
      {preview ? (
        <div
          hidden
          data-kalp-studio-preview-id={preview.changeSetId}
          data-kalp-studio-preview-expires={preview.expiresAt}
          data-kalp-studio-page-checksum={preview.handshake.pageChecksum}
          data-kalp-studio-theme-checksum={preview.handshake.themeChecksum}
        />
      ) : null}
      <HomePageServer data={data as never} lang={locale} />
    </>
  );
}
