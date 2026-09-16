import { NextResponse } from "next/server";
import { connectTenantDB } from "@/lib/db";

export const dynamic = "force-dynamic";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const current = text(value);
    if (current) return current;
  }
  return "";
}

function sanitizeUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  // Strip localhost/127.0.0.1:5177 origin so images load from local public / Vercel public
  return rawUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5177(?=\/)/i, "");
}

function buildBrandConfig(payload: any, fallback: any) {
  const business = payload?.business || {};
  const brand = business?.brand || {};
  const brandKit = payload?.brandKit || fallback?.brandKit || {};
  const publicProfile = payload?.publicProfile || fallback?.publicProfile || {};
  const fallbackLogo = Array.isArray(fallback?.logos) ? fallback.logos[0]?.url : "";
  const rawLogoUrl = firstText(
    brand.logoRef,
    brand.businessDna?.logoUrl,
    publicProfile.logoUrl,
    publicProfile.logo,
    brandKit.logo?.primary,
    brandKit.logo?.icon,
    fallback?.logoUrl,
    fallbackLogo,
  );
  const logoUrl = sanitizeUrl(rawLogoUrl);

  const rawFaviconUrl = firstText(
    brand.faviconRef,
    brand.businessDna?.faviconUrl,
    brandKit.logo?.favicon,
    brandKit.faviconUrl,
    fallback?.faviconUrl,
  );
  const faviconUrl = sanitizeUrl(rawFaviconUrl);

  return {
    ...(fallback || {}),
    ...payload,
    logoUrl,
    faviconUrl,
    publicProfile: { ...publicProfile, logo: logoUrl, logoUrl },
    brandKit: {
      ...brandKit,
      logo: { ...(brandKit.logo || {}), primary: logoUrl, light: logoUrl, icon: logoUrl, favicon: faviconUrl },
      faviconUrl,
    },
    companyInfo: {
      ...(fallback?.companyInfo || {}),
      name: firstText(business.name, fallback?.companyInfo?.name, "NestCraft"),
      tagline: firstText(brand.tagline, brand.businessDna?.tagline, fallback?.companyInfo?.tagline),
    },
    logos: logoUrl
      ? [{ id: "primary", url: logoUrl, alt: `${firstText(business.name, fallback?.companyInfo?.name, "NestCraft")} logo`, width: 120, height: 40 }]
      : fallback?.logos || [],
  };
}

async function readLocalBranding() {
  try {
    const db = await connectTenantDB();
    return await db.collection("tenant_registry").findOne({ type: "branding" });
  } catch {
    return null;
  }
}

async function readRemoteBranding(fallback: any) {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "https://zero.kalptree.xyz";
  const apiCandidates = [
    ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5177"]),
    adminUrl,
    configuredApiUrl,
  ].filter(Boolean) as string[];

  const tenantDb = process.env.NEXT_PUBLIC_TENANT_ID || "kp_nestcraft";
  const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || tenantDb.replace(/^kalp_tenant_/, "") || "nestcraft";
  if (!tenantDb) return null;

  for (const apiUrl of apiCandidates) {
    try {
      const response = await fetch(`${apiUrl}/api/cms/business-blueprint`, {
        headers: { "x-tenant-db": tenantDb, "tenant-slug": tenantSlug, "x-tenant-slug": tenantSlug },
        cache: "no-store",
      });
      if (!response.ok) continue;
      const body = await response.json();
      const payload = body?.data?.payload || body?.data || body;
      const config = buildBrandConfig(payload, fallback);
      if (config?.logoUrl) {
        return config;
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function GET() {
  const fallback = await readLocalBranding();
  const branding = await readRemoteBranding(fallback);
  return NextResponse.json({ branding: branding || fallback || null }, { headers: { "Cache-Control": "no-store" } });
}
