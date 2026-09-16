import type { Page } from "@/lib/store/pages/pageType";

export interface PublicSiteEnvelope {
  tenant_slug: string;
  business_label: string;
  public_theme: Record<string, any>;
  public_navigation: Array<Record<string, any>>;
  vocabulary: Record<string, any>;
  page: Record<string, any>;
  discovery: Record<string, any>;
  permalinkDetails?: Record<string, any>;
}

function businessApiBaseUrl(): string {
  const configured =
    process.env.FASTAPI_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;
  return (configured?.startsWith("http://") || configured?.startsWith("https://")
    ? configured
    : "http://127.0.0.1:8000").replace(/\/$/, "");
}

export function configuredTenantSlug(): string {
  const value = process.env.NEXT_PUBLIC_TENANT_SLUG?.trim() || "nestcraft";
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(value)) {
    throw new Error("NestCraft public tenant slug is invalid");
  }
  return value;
}

export async function fetchPublicSitePage(
  pageSlug: string,
): Promise<PublicSiteEnvelope | null> {
  const tenantSlug = configuredTenantSlug();
  const url = new URL(
    `/publishing/public/${encodeURIComponent(tenantSlug)}/site`,
    businessApiBaseUrl(),
  );
  url.searchParams.set("page_slug", pageSlug);

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Public Page contract returned ${response.status}`);
  }
  return (await response.json()) as PublicSiteEnvelope;
}

function localized(value: unknown): { en: string; hi: string } | undefined {
  if (typeof value === "string" && value.trim()) {
    return { en: value, hi: value };
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const en = typeof record.en === "string" ? record.en : "";
    const hi = typeof record.hi === "string" ? record.hi : en;
    if (en || hi) return { en: en || hi, hi: hi || en };
  }
  return undefined;
}

export function normalizePublicPage(
  envelope: PublicSiteEnvelope | null,
): Page | null {
  if (!envelope?.page) return null;
  const source = envelope.page;
  const rawContent = source.content ?? source.blocks ?? [];
  const content = rawContent.map((block: any) => {
    if (block.adminTitle) return block;
    const blockId = block.id || "";
    const type = block.type || "";
    const c = block.content || {};
    const p = block.props || {};

    if (type === "hero.split" || type === "nestcraft.hero.carousel" || blockId === "home-hero" || blockId === "sec-hero") {
      const parsedContent = Array.isArray(c) && c.length > 0 ? c : Array.isArray(c.columns?.[0]) && c.columns[0].length > 0 ? c.columns[0] : Array.isArray(c.items) && c.items.length > 0 ? c.items : [{ props: { ...p, title: c.heading, description: c.body, image: c.image || "https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=2727&auto=format&fit=crop" } }];
      return {
        ...block,
        adminTitle: "Premium Hero Slider",
        content: parsedContent
      };
    }
    if (type === "trust.strip" || type === "nestcraft.trust.strip" || blockId === "home-trust" || blockId === "sec-usp") {
      const parsedContent = Array.isArray(c) && c.length > 0 ? c : Array.isArray(c.columns?.[0]) && c.columns[0].length > 0 ? c.columns[0] : Array.isArray(c.items) && c.items.length > 0 ? c.items.map((item: any) => typeof item === "string" ? { props: { title: item } } : item) : [];
      return {
        ...block,
        adminTitle: "USP Section",
        content: parsedContent
      };
    }
    if (type === "product.grid" || type === "nestcraft.product.grid" || type === "nestcraft.product.carousel" || blockId === "home-featured-products") {
      return {
        ...block,
        adminTitle: "New Essentials Slider",
        props: { ...p, heading: c.heading, limit: block.dataSource?.limit || 8 }
      };
    }
    if (type === "story.feature" || type === "nestcraft.story.feature" || blockId === "home-story") {
      return {
        ...block,
        adminTitle: "Craft & Quality Section",
        content: [{ props: { ...p, title: c.heading, description: c.body } }]
      };
    }
    if (type === "newsletter.form" || type === "nestcraft.newsletter.form" || blockId === "home-newsletter") {
      return {
        ...block,
        adminTitle: "Newsletter Section",
        props: { ...p, title: c.heading, description: c.body }
      };
    }
    return block;
  });

  return {
    ...source,
    title: localized(source.title) || { en: source.slug || "Page", hi: source.slug || "Page" },
    slug: String(source.slug ?? source.page_slug ?? ""),
    content,
    metaTitle: localized(source.metaTitle ?? source.seo_title ?? source.title),
    metaDescription: localized(
      source.metaDescription ?? source.seo_description ?? source.description,
    ),
    isPublished:
      typeof source.isPublished === "boolean"
        ? source.isPublished
        : source.status
          ? ["published", "live", "active"].includes(String(source.status))
          : true,
  } as Page;
}

export function brandingFromPublicSite(envelope: PublicSiteEnvelope | null) {
  if (!envelope) return null;
  const theme = envelope.public_theme || {};
  const logos = Array.isArray(theme.logos) ? theme.logos : [];
  return {
    logos,
    companyInfo: {
      name: envelope.business_label || "NestCraft",
      tagline: String(theme.tagline || ""),
      foundedYear: String(theme.foundedYear || ""),
    },
    locations: [],
    contact: { primaryEmail: "", supportEmail: "", phoneDisplay: false },
    socialMedia: [],
    legal: {
      companyLegalName: envelope.business_label || "NestCraft",
      privacyPolicyUrl: "/privacy-policy",
      termsUrl: "/terms",
      copyrightText: "",
    },
    languages: {
      available: [
        { code: "en", name: "English", enabled: true },
        { code: "hi", name: "Hindi", enabled: true },
      ],
      default: "en",
    },
    currencies: {
      available: [{ code: "INR", symbol: "₹", name: "Indian Rupee", enabled: true }],
      default: "INR",
    },
  };
}

export function blueprintFromPublicSite(envelope: PublicSiteEnvelope | null) {
  if (!envelope) return null;
  return {
    id: `public:${envelope.tenant_slug}`,
    tenant_slug: envelope.tenant_slug,
    document_key: "public-site-contract",
    payload: {
      tenant_id: "",
      tenant_slug: envelope.tenant_slug,
      version: 1,
      business_label: envelope.business_label,
      public_theme: envelope.public_theme || {},
      brandAssets: envelope.public_theme || {},
      public_navigation: envelope.public_navigation || [],
      vocabulary: envelope.vocabulary || {},
      permalinkDetails: envelope.permalinkDetails || {},
    },
  };
}
