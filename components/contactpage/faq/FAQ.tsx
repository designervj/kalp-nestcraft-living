"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import { defaultFaqData } from './faqData';
import { useAppSelector } from "@/lib/store/hooks";
import { usePathname } from "next/navigation";
import EditableText from "@/components/shared/EditableText";

interface FAQProps {
  data?: any;
}

export const FAQ: React.FC<FAQProps> = ({ data }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { currentPages } = useAppSelector((state) => state.pages);
  const pathname = usePathname();

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const faqSection = useMemo(() => {
    return currentPages?.content?.find((s: any) => s.adminTitle === "Contact FAQ");
  }, [currentPages]);

  const content = faqSection?.props || data || defaultFaqData.props;

  const getLocalizedValue = (val: any) => {
    if (!val) return "";
    if (typeof val === "object") {
      return val[lang] || val.en || "";
    }
    return val;
  };

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-[5%] relative overflow-hidden">
      {/* Background Decorator */}
      <div className="absolute inset-0 bg-surface/20 backdrop-blur-[2px] z-0" />
      <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-surface/50 border border-border/50 backdrop-blur-md">
            <p className="text-secondary uppercase tracking-[4px] text-[11px] font-black">
              <EditableText
                value={getLocalizedValue(content.label)}
                currentPages={currentPages}
                sectionId={faqSection?.id}
                fieldPath="props.label"
              />
            </p>
          </div>
          <EditableText value={getLocalizedValue(content.heading)}
              currentPages={currentPages}
              sectionId={faqSection?.id}
              fieldPath="props.heading" tag="h2" className="text-[40px] md:text-[56px] font-black tracking-tight text-foreground" />
        </motion.div>

        <div className="space-y-3">
          {content.questions?.map((faq: any, idx: number) => {
            const isExpanded = expandedIndex === idx;

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
                onClick={() => toggleAccordion(idx)}
              >
                <div className="p-5 md:p-6">
                  <h4 className={`text-lg md:text-xl font-bold flex items-center justify-between gap-4 transition-colors duration-300 text-foreground`}>
                    <span onClick={(e) => e.stopPropagation()} className="leading-tight">
                      <EditableText
                        value={getLocalizedValue(faq.q)}
                        currentPages={currentPages}
                        sectionId={faqSection?.id}
                        fieldPath={`props.questions.${idx}.q`}
                      />
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
                          <div className="text-muted font-medium text-lg leading-relaxed">
                            <EditableText
                              value={getLocalizedValue(faq.a)}
                              currentPages={currentPages}
                              sectionId={faqSection?.id}
                              fieldPath={`props.questions.${idx}.a`}
                              tag="p"
                            />
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
      </div>
    </section>
  );
};
