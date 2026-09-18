import React from "react";
import Hero from "../homepage/hero/Hero";
import USP from "../homepage/usp/USP";
import Services from "../homepage/service/Service";
import Collections from "../homepage/collections/Collections";
import ShopByRoom from "../homepage/shopByRoom/ShopByRoom";
import FeaturedBanner from "../homepage/featuredBanner/FeaturedBanner";
import ProductSlider from "../homepage/productSlider/ProductSlider";
import Craft from "../homepage/craft/Craft";
import Testimonials from "../homepage/testimonials/Testimonials";
import Blog from "../homepage/blog/Blog";
import Newsletter from "../homepage/newsletter/Newsletter";
import FAQ from "../homepage/faq/FAQ";
import InstagramGallery from "../homepage/instagram/InstagramGallery";
import LogoStrip from "../homepage/logoStrip/LogoStrip";
import { getSection, getV } from "@/lib/cmsUtils";
import Link from "next/link";

// Client-only initializers
import GetAllPages from "./GetAllPages";
import GetAllMenus from "../cms/menus/GetAllMenus";
import PageDataInitializer from "./PageDataInitializer";

interface HomePageServerProps {
  data: {
    content: any[];
    [key: string]: any;
  };
  lang: string;
}

const HomePageServer = ({ data, lang }: HomePageServerProps) => {
  console.log("data", data)
  const content = Array.isArray(data?.content) ? data.content : [];

  const ctaSection = getSection(content, "CTA");
  const ctaBlock = ctaSection?.content?.[0] || ctaSection;

  const ctaTitle = getV(ctaBlock?.props?.title, lang) || ctaBlock?.title || "";
  const ctaDescription =
    getV(ctaBlock?.props?.description, lang) || ctaBlock?.description || "";
  const ctaButtonLabel =
    getV(ctaBlock?.props?.buttonLabel, lang) || ctaBlock?.buttonLabel || "";
  const ctaButtonLink =
    ctaBlock?.props?.buttonLink?.value || ctaBlock?.buttonLink || "/shop";
  const ctaSecondaryLabel = getV(ctaBlock?.props?.secondaryButtonLabel, lang);
  const ctaSecondaryLink =
    ctaBlock?.props?.secondaryButtonLink?.value || "/contact";

  return (
    <>
      {/* Client-side logic components */}
      <PageDataInitializer initialData={data as never} />
      <GetAllPages />
      <GetAllMenus />

      {/* Content is rendered from the server-read site_pages document. */}
      <Hero section={getSection(content, "Premium Hero Slider")} />
      <USP section={getSection(content, "USP Section")} />

      <Collections section={getSection(content, "Collections")} />
      <ShopByRoom section={getSection(content, "Shop By Room Section")} />
      <FeaturedBanner section={getSection(content, "FeaturedBanner")} />
      <ProductSlider section={getSection(content, "New Essentials Slider")} />
      <Services section={getSection(content, "Services")} />
      <Craft section={getSection(content, "Craft & Quality Section")} />
      <Testimonials section={getSection(content, "Customer Testimonials")} />
      <Blog section={getSection(content, "Latest Blog Posts")} />
      <FAQ section={getSection(content, "Homepage FAQs")} />
      <Newsletter section={getSection(content, "Newsletter Section")} />
      <InstagramGallery section={getSection(content, "Instagram Gallery")} />
      <LogoStrip section={getSection(content, "Client Logos")} />

      {ctaBlock && (
        <section
          data-annotate-id="home-cta-section"
          className="relative text-surface text-center py-[110px] px-[5%] border-t border-border overflow-hidden bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000')"
          }}
        >
          <div className="absolute inset-0 bg-secondary/85 z-0"></div>
          
          <div className="relative z-10 opacity-100 transform-none">
            <h2 className="text-[38px] lg:text-[48px] font-bold tracking-tight  text-white">
              {ctaTitle}
            </h2>
            <p className="text-white/70 font-semibold mt-[18px] mb-[34px] max-w-[600px] mx-auto">
              {ctaDescription}
            </p>
            <div className="flex gap-3.5 justify-center flex-wrap">
              <Link
                href={ctaButtonLink}
                className="bg-primary text-white px-8 h-12 rounded-full text-[14px] font-semibold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center"
              >
                {ctaButtonLabel}
              </Link>
              {ctaSecondaryLabel && (
                <Link
                  href={ctaSecondaryLink}
                  className="px-8 h-12 rounded-full border border-white/55 text-white text-[14px] font-semibold uppercase tracking-wider hover:bg-white/10 transition-all flex items-center"
                >
                  {ctaSecondaryLabel}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default HomePageServer;
