"use client";

import React, { useState, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";
import {
  formatCommercePrice,
  normalizeCommerceProduct,
  resolveProductImage,
} from "@/lib/commerce/product-normalization";
import { defaultProductSliderData } from "./productSliderData";

interface ProductSliderProps {
  section?: any;
}

const ProductSlider = ({ section: propSection }: ProductSliderProps) => {
  const dispatch = useAppDispatch();
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const currentPages = useAppSelector((state) => state.pages.currentPages);
  const isEditable = useAppSelector((state) => state.pages.isEditable);
  const catalogProducts = useAppSelector(
    (state) => state.adminProducts.allProducts,
  );

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "hi") return "hi";
    return "en";
  }, [pathname]);

  const getCurrentSection = useMemo(() => {
    if (!currentPages || !Array.isArray(currentPages.content)) return;
    return currentPages.content.find((page: any) => page?.adminTitle === "New Essentials Slider");
  }, [currentPages]);

  const section = propSection || getCurrentSection;

  const p = (section as any)?.props || {};
  const configuredSlugs = Array.isArray(p.productSlugs?.value)
    ? p.productSlugs.value
    : Array.isArray(p.productSlugs)
      ? p.productSlugs
      : [];
  const limit = Math.max(1, Math.min(Number(p.limit?.value ?? p.limit ?? 8), 20));
  const normalizedProducts = catalogProducts.map(normalizeCommerceProduct);
  const featuredProducts = (
    configuredSlugs.length
      ? configuredSlugs
          .map((slug: string) =>
            normalizedProducts.find((product: any) => product.slug === slug),
          )
          .filter(Boolean)
      : normalizedProducts.filter((product: any) => product.status === "active")
  ).slice(0, limit);

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const badge = getV(p.badge);
  const heading = getV(p.heading);
  const viewAllLabel = getV(p.viewAllLabel);
  const viewAllLink = p.viewAllLink?.value || p.viewAllLink || "/shop";

  const handle = (fieldPath: string) => (value: string) =>
    saveField(dispatch, currentPages, section?.id, fieldPath, value);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      setActivePage(Math.round(scrollLeft / clientWidth));
    }
  };

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      const child = scrollRef.current.firstElementChild as HTMLElement;
      if (child) {
        const itemWidth = child.offsetWidth;
        const gap = 24;
        scrollRef.current.scrollBy({
          left: dir * (itemWidth + gap),
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <section
      data-annotate-id="home-product-slider-section"
      className="md:py-[120px] md:px-[5%] py-[50px] px-[5%] "
    >
      <div className="flex justify-between items-end mb-[60px] gap-[18px]">
        <div>
          <p className="text-secondary uppercase tracking-[3px] text-[12px] font-black mb-2.5">
            <EditableText value={badge} isEditable={isEditable} onSave={handle('props.badge.en')} tag="span" />
          </p>
          <EditableText value={heading} isEditable={isEditable} onSave={handle('props.heading.en')}  tag="h2" className="md:text-[38px] text-[28px] font-bold leading-tight tracking-tight" />
        </div>
        <Link
          href={viewAllLink}
          className="px-6 h-11 rounded-full border border-secondary/45 text-foreground text-[14px] font-semibold uppercase tracking-wider hover:bg-secondary/15 transition-all flex items-center md:flex hidden"
        >
          <EditableText value={viewAllLabel} isEditable={isEditable} onSave={handle('props.viewAllLabel.en')} tag="span" />
        </Link>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-1"
        >
          {(featuredProducts.length > 0 ? featuredProducts : defaultProductSliderData.content).map((prod: any, idx: number) => {
          const isFallback = !!prod.props;
          const sp = prod.props || {};
          const title = isFallback ? (getV(sp.title) || "") : (prod.name || prod.title || "");
          const price = isFallback ? (getV(sp.price) || "") : formatCommercePrice(prod.price, prod.currency || "INR");
          const prodBadge = getV(p.itemBadge) || (isFallback ? getV(sp.badge) : "");
          const id = prod.slug || prod.id || prod._id;
          const img = isFallback ? (getV(sp.image) || sp.image?.value || sp.image || prod.image || "") : resolveProductImage(prod);

            return (
              <div
                key={id || idx}
                className="min-w-[calc(100%-24px)] md:min-w-[calc((100%-48px)/3)] snap-start group"
              >
                <Link href={isFallback ? "/shop" : `/product/${id}`} className="block">
                  <div className="relative h-[380px] mb-4 overflow-hidden rounded-lg border border-border bg-muted/10">
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-260 group-hover:scale-105"
                    />
                    {prodBadge && (
                      <div className="absolute top-3.5 left-3.5 bg-surface/88 backdrop-blur-md border border-border p-[8px_10px] rounded-full text-[10px] font-black tracking-[2px] uppercase text-foreground">
                        <EditableText value={prodBadge} isEditable={isEditable} onSave={handle(`content.${idx}.props.badge.en`)} tag="span" />
                      </div>
                    )}
                    <span
                      className="absolute bottom-0 w-full p-[15px] bg-foreground/92 text-surface text-[12px] font-black tracking-[2px] uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-220"
                    >
                      VIEW PRODUCT — {price}
                    </span>
                  </div>
                  <div>
                    <EditableText value={title} isEditable={isEditable} onSave={handle(`content.${idx}.props.title.en`)}  tag="h4" className="font-heading text-[26px] font-bold leading-tight mb-1.5" />
                    <div className="flex justify-between items-center gap-2.5">
                      <div className="text-muted text-[14px] font-black">{price}</div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3.5 mt-[22px]">
          <div className="flex gap-2.5">
            <button
              onClick={() => scroll(-1)}
              className="w-11 h-11 rounded-full border border-border bg-surface flex items-center justify-center hover:-translate-y-0.5 hover:border-secondary/55 transition-all text-foreground"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-11 h-11 rounded-full border border-border bg-surface flex items-center justify-center hover:-translate-y-0.5 hover:border-secondary/55 transition-all text-foreground"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex gap-2.5 justify-center flex-1">
            {Array.from({ length: Math.ceil(featuredProducts.length / 1) }).map(
              (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-160 ${activePage === i ? "bg-secondary scale-125" : "bg-foreground/20"}`}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
