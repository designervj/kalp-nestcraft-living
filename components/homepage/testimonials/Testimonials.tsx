"use client";

import React, { useState, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";
import { getContentItems } from "@/lib/cmsUtils";

import { defaultTestimonials, defaultTestimonialProps } from "./testimonialsData";

interface TestimonialsProps {
  section?: any;
}

const Testimonials = ({ section: propSection }: TestimonialsProps) => {
  const dispatch = useAppDispatch();
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const currentPages = useAppSelector((state) => state.pages.currentPages);
  const isEditable = useAppSelector((state) => state.pages.isEditable);

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "hi") return "hi";
    return "en";
  }, [pathname]);

  const getCurrentSection = useMemo(() => {
    if (!currentPages) return;
    return currentPages.content?.find((page: any) => page?.id === propSection?.id || page?.adminTitle === "Customer Testimonials");
  }, [currentPages, propSection?.id]);

  const section = getCurrentSection || propSection;

  const rawProps = (section as any)?.props;
  const rawItems = getContentItems((section as any)?.content);

  const p = rawProps || defaultTestimonialProps;
  const items = rawItems.length > 0 ? rawItems : defaultTestimonials;

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const badge = getV(p.badge);
  const heading = getV(p.heading);

  const handle = (fieldPath: string) => (value: string) =>
    saveField(dispatch, currentPages, section?.id, fieldPath, value);

  const handleScroll = () => {
    if (scrollRef.current) {
      const child = scrollRef.current.firstElementChild as HTMLElement;
      if (child) {
        const itemWidth = child.offsetWidth + 24;
        const { scrollLeft } = scrollRef.current;
        const page = Math.round(scrollLeft / itemWidth);
        setActivePage(page);
      }
    }
  };

  const scrollToPage = (pageIndex: number) => {
    if (scrollRef.current) {
      const child = scrollRef.current.firstElementChild as HTMLElement;
      if (child) {
        const itemWidth = child.offsetWidth + 24;
        scrollRef.current.scrollTo({
          left: pageIndex * itemWidth,
          behavior: "smooth",
        });
        setActivePage(pageIndex);
      }
    }
  };

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      const child = scrollRef.current.firstElementChild as HTMLElement;
      if (child) {
        const itemWidth = child.offsetWidth + 24;
        const targetPage = activePage + dir;
        const maxPage = items.length - 1;
        const nextTarget = Math.max(0, Math.min(targetPage, maxPage));
        scrollToPage(nextTarget);
      }
    }
  };

  const hasSlider = items.length > 3;

  return (
    <section
      data-annotate-id="home-testimonials-section"
      className="md:py-[120px] md:px-[5%] py-[50px] px-[5%]  bg-surface/55"
    >
      <div className="flex justify-center text-center mb-[60px]">
        <div>
          <p className="text-secondary uppercase tracking-[3px] text-[12px] font-black mb-2.5">
            <EditableText value={badge} isEditable={isEditable} onSave={handle('props.badge.en')} tag="span" />
          </p>
          <EditableText value={heading} isEditable={isEditable} onSave={handle('props.heading.en')}  tag="h2" className="md:text-[38px] text-[28px] font-bold leading-tight tracking-tight" />
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={
            hasSlider
              ? "flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-1"
              : "grid grid-cols-1 md:grid-cols-3 gap-6"
          }
        >
          {items.map((item: any, idx: number) => {
            const sp = item.props || {};
            const quote = getV(sp.quote) || getV(item.quote) || "";
            const author = getV(sp.author) || getV(item.author) || "";
            const role = getV(sp.role) || getV(item.role) || "";

            return (
              <div
                key={idx}
                className={
                  hasSlider
                    ? "min-w-[calc(100%-24px)] md:min-w-[calc((100%-48px)/3)] snap-start h-full"
                    : "w-full h-full"
                }
              >
                <div className="p-9 text-center bg-surface/75 border border-border rounded-lg h-full">
                  <p className="font-heading text-[22px] italic mb-[22px] leading-[1.4] font-semibold text-foreground/90">
                    <EditableText value={quote} isEditable={isEditable} onSave={handle(`content.${idx}.props.quote.en`)} tag="span" />
                  </p>
                  <div className="uppercase text-[11px] tracking-[3px] font-black text-foreground/70">
                    &mdash; <EditableText value={author} isEditable={isEditable} onSave={handle(`content.${idx}.props.author.en`)} tag="span" />
                    {role ? `, ` : ""}
                    <EditableText value={role} isEditable={isEditable} onSave={handle(`content.${idx}.props.role.en`)} tag="span" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasSlider && (
          <div className="flex items-center gap-2.5 mt-[22px]">
            <button
              onClick={() => scroll(-1)}
              className="w-11 h-11 rounded-full border border-border bg-surface flex items-center justify-center hover:-translate-y-0.5 hover:border-secondary/55 transition-all text-foreground cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-11 h-11 rounded-full border border-border bg-surface flex items-center justify-center hover:-translate-y-0.5 hover:border-secondary/55 transition-all text-foreground cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
