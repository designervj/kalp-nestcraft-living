
const adminTitleToIdMap: Record<string, string> = {
  "Premium Hero Slider": "sec-hero",
  "USP Section": "sec-usp",
  "Services": "sec-services",
  "Collections": "sec-collections",
  "Shop By Room Section": "sec-shop-by-room",
  "FeaturedBanner": "sec-featured-banner",
  "New Essentials Slider": "sec-product-slider",
  "Craft & Quality Section": "sec-craft",
  "Customer Testimonials": "sec-testimonials",
  "Latest Blog Posts": "sec-blog",
  "Homepage FAQs": "sec-faq",
  "Newsletter Section": "sec-newsletter",
  "Instagram Gallery": "sec-instagram",
  "Client Logos": "sec-client-logos",
  "CTA": "sec-cta"
};

export const getSection = (content: any, adminTitle: string) => {
  if (!Array.isArray(content)) return undefined;
  const section = content.find(
    (s: any) =>
      s?.adminTitle === adminTitle ||
      s?.id === adminTitleToIdMap[adminTitle] ||
      s?.id === adminTitle
  );
  if (section && section.content && typeof section.content === "object" && !Array.isArray(section.content)) {
    return { ...section, content: Array.isArray(section.content.items) ? section.content.items : [] };
  }
  return section;
};
export const getV = (field: any, lang: string) => {
  if (!field) return "";
  const val = field.value !== undefined ? field.value : field;
  if (val && typeof val === "object") return val[lang] || val.en || "";
  return val || "";
};

export const getContentItems = (content: any) => {
  if (Array.isArray(content)) return content;
  if (Array.isArray(content?.items)) return content.items;
  return [];
};
