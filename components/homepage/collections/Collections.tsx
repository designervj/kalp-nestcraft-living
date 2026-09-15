"use client";
import React, { useMemo } from "react";
import { resolveCategoryImage } from "@/lib/commerce/product-normalization";
import { defaultCollections, defaultCollectionProps } from "./collectionsData";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";

interface CollectionsProps {
  section?: any;
}

const Collections = ({ section: propSection }: CollectionsProps) => {
  const dispatch = useAppDispatch();
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
    return currentPages.content?.find(
      (page: any) => page?.id === propSection?.id || page?.adminTitle === "Collections",
    );
  }, [currentPages, propSection?.id]);

  const section = getCurrentSection || propSection;

  const rawProps = (section as any)?.props;
  const rawItems = (section as any)?.content;
  
  const p = rawProps || defaultCollectionProps;
  const items = Array.isArray(rawItems) && rawItems.length > 0 ? rawItems : defaultCollections;

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const heading = getV(p?.heading);
  const viewAllLabel = getV(p?.viewAllLabel);
  const viewAllLink = p?.viewAllLink?.value || p?.viewAllLink || "/category";

  const handle = (fieldPath: string) => (value: string) =>
    saveField(dispatch, currentPages, section?.id, fieldPath, value);

  return (
    <section
      data-annotate-id="home-collections"
      className="md:py-[120px] md:px-[5%] py-[50px] px-[5%] "
    >
      <div className="flex justify-between items-end mb-[40px] md:mb-[60px] gap-4 md:gap-[18px]">
        <EditableText value={heading} isEditable={isEditable} onSave={handle('props.heading.en')}  tag="h2" className="md:text-[38px] text-[28px] font-bold leading-tight tracking-tight" />
        <Link
          href={viewAllLink}
          className="px-[26px] py-[10px] rounded-full border border-border text-[12px] font-black tracking-[2px] uppercase hover:border-secondary hover:text-secondary transition-colors"
        >
          <EditableText value={viewAllLabel} isEditable={isEditable} onSave={handle('props.viewAllLabel.en')} tag="span" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 md:gap-5 gap-3.5">
        {items?.map((item: any, idx: number) => {
          if (!item) return null;
          const sp = item.props || {};
          const title = getV(sp.title) || getV(item.title) || "";
          let image = getV(sp.image) || sp.image?.value || sp.image || item.image || resolveCategoryImage(item) || "";
          
          const nameStr = title.toLowerCase();
          if (nameStr.includes("living")) {
            image = "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200";
          } else if (nameStr.includes("bed")) {
            image = "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200";
          } else if (nameStr.includes("din")) {
            image = "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&q=80&w=1200";
          } else if (nameStr.includes("office") || nameStr.includes("study")) {
            image = "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200";
          } else if (nameStr.includes("storage")) {
            image = "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=1200";
          }
          const link = sp.link?.value || sp.link || item.link || "/shop";

          return (
            <Link
              key={idx}
              href={link}
              className="relative h-[450px] overflow-hidden rounded-md border border-border group cursor-pointer block"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="w-full h-full"
              >
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-260 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-85 pointer-events-none" />
                <div className="absolute bottom-7 left-7 text-white z-10">
                  <EditableText value={title} isEditable={isEditable} onSave={handle(`content.${idx}.props.title.en`)}  tag="h3" className="text-[26px] font-bold" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Collections;
