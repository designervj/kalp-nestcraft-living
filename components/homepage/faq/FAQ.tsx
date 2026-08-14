"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";

import { defaultFAQs } from "./faqData";

interface FAQProps {
  section?: any;
}

const FAQ = ({ section: propSection }: FAQProps) => {
  const dispatch = useAppDispatch();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
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
    return currentPages.content?.find((page: any) => page?.adminTitle === "Homepage FAQs");
  }, [currentPages]);

  const section = propSection || getCurrentSection;

  const p = (section as any)?.props || {};

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const heading = getV(p.heading);
  const subheading = getV(p.subheading) || "";
  const viewAllLabel = getV(p.viewAllLabel);
  const viewAllLink = p.viewAllLink?.value || p.viewAllLink || "/faq";

  const rawItems = (section as any)?.content;
  const items = Array.isArray(rawItems) && rawItems.length > 0 ? rawItems : defaultFAQs;

  const handle = (fieldPath: string) => (value: string) =>
    saveField(dispatch, currentPages, section?.id, fieldPath, value);

  return (
    <section
      data-annotate-id="home-faq-section"
      className="md:py-[120px] md:px-[5%] py-[50px] px-[5%] "
    >
      <div className="flex flex-col items-center text-center mb-[60px]">
        <EditableText value={heading} isEditable={isEditable} onSave={handle('props.heading.en')}  tag="h2" className="md:text-[38px] text-[28px] font-bold leading-tight tracking-tight mb-4" />
        {subheading && <p className="text-muted max-w-2xl mb-6"><EditableText value={subheading} isEditable={isEditable} onSave={handle('props.subheading.en')} tag="span" /></p>}
        <Link
          href={viewAllLink}
          className="text-secondary font-black tracking-[2px] uppercase text-xs border-b border-secondary pb-1"
        >
          <EditableText value={viewAllLabel} isEditable={isEditable} onSave={handle('props.viewAllLabel.en')} tag="span" />
        </Link>
      </div>

      <div className="max-w-[800px] mx-auto space-y-3">
        {items.map((faq: any, idx: number) => {
          const fp = faq.props || {};
          const title = getV(fp.title) || getV(faq.title) || "";
          const description = getV(fp.description) || getV(faq.description) || "";
          const isExpanded = activeIndex === idx;

          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              key={idx}
              className={`bg-surface/40 backdrop-blur-md border rounded-xl transition-all duration-500 cursor-pointer group shadow-sm ${
                isExpanded ? 'border-primary/40 bg-surface/60 shadow-[0_10px_40px_rgba(13,101,51,0.08)]' : 'border-border/60 hover:border-secondary/50 hover:bg-surface/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
              }`}
              onClick={() => setActiveIndex(isExpanded ? null : idx)}
            >
              <div className="p-5 md:p-6">
                <h4 className="text-[18px] md:text-[20px] font-bold flex items-center justify-between gap-4 transition-colors duration-300 text-foreground font-heading">
                  <span onClick={(e) => e.stopPropagation()} className="leading-tight">
                    <EditableText value={title} isEditable={isEditable} onSave={handle(`content.${idx}.props.title.en`)} tag="span" />
                  </span>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isExpanded ? 'bg-primary text-white rotate-180 shadow-md' : 'bg-surface border border-border text-muted group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20'
                  }`}>
                    {isExpanded ? <Minus size={20} strokeWidth={2.5} /> : <Plus size={20} strokeWidth={2.5} />}
                  </div>
                </h4>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-5 border-t border-border/50 mt-5" onClick={(e) => e.stopPropagation()}>
                        <div className="text-muted font-medium text-[15px] leading-relaxed">
                          <EditableText value={description} isEditable={isEditable} onSave={handle(`content.${idx}.props.description.en`)} tag="div" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQ;
