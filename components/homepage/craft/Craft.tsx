"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import EditableText from "@/components/shared/EditableText";
import { saveField } from "@/lib/editorUtils";

interface CraftProps {
  section?: any;
}

const Craft = ({ section: propSection }: CraftProps) => {
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
    return currentPages.content?.find((page: any) => page?.adminTitle === "Craft & Quality Section");
  }, [currentPages]);

  const section = propSection || getCurrentSection;
  const rawContent = (section as any)?.content || [];
  const content = Array.isArray(rawContent) ? rawContent : [];

  const p = (section as any)?.props || {};

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object") return val[lang] || val.en || "";
    return val || "";
  };

  const badge = getV(p.badge);
  const title = getV(p.title);
  const buttonLabel = getV(p.buttonLabel);
  const buttonLink = p.buttonLink?.value || p.buttonLink || "/about";
  const mainHeading = getV(p.mainHeading);
  const description = getV(p.description);

  const imgBlock = content.find((b: any) => b.type === "image");
  const listBlock = content.find((b: any) => b.type === "list");
  const buttonsBlock = content.find((b: any) => b.type === "buttons");

  const listItems = listBlock?.items || listBlock?.props?.items?.value || listBlock?.props?.items || [];
  const buttons = buttonsBlock?.items || buttonsBlock?.props?.items?.value || buttonsBlock?.props?.items || [];

  const handle = (fieldPath: string) => (value: string) =>
    saveField(dispatch, currentPages, section?.id, fieldPath, value);

  return (
    <section
      data-annotate-id="home-craft-section"
      className="md:py-[120px] md:px-[5%] py-[50px] px-[5%]  bg-surface/50 border-y border-border"
    >
      <div className="flex justify-between items-end mb-[60px] gap-[18px]">
        <div>
          <p className="text-secondary uppercase tracking-[3px] text-[12px] font-black mb-2.5">
            <EditableText value={badge} isEditable={isEditable} onSave={handle('props.badge.en')} tag="span" />
          </p>
          <EditableText value={title} isEditable={isEditable} onSave={handle('props.title.en')}  tag="h2" className="md:text-[38px] text-[28px] font-bold leading-tight tracking-tight" />
        </div>
        <Link
          href={buttonLink}
          className="px-[18px] h-11 rounded-full bg-secondary/18 text-dark border border-secondary/35 text-[14px] font-semibold uppercase tracking-wider hover:bg-secondary/26 hover:border-secondary/55 transition-all flex items-center md:flex hidden"
        >
          <EditableText value={buttonLabel} isEditable={isEditable} onSave={handle('props.buttonLabel.en')} tag="span" />
        </Link>
      </div>

      <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center mt-[40px]">
        {/* Image side */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full lg:w-[65%] h-[450px] lg:h-[650px] rounded-[24px] overflow-hidden shadow-2xl relative z-10"
        >
          <img
            src={imgBlock?.url || "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&q=80&w=1600"}
            alt={imgBlock?.alt || "Materials"}
            className="w-full h-full object-cover transition-transform duration-[1.5s] hover:scale-[1.03]"
          />
        </motion.div>

        {/* Text Card Side */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-[92%] lg:w-[45%] -mt-20 lg:mt-0 lg:-ml-32 relative z-20"
        >
          <div className="bg-surface/95 backdrop-blur-xl border border-border p-[40px] lg:p-[60px] rounded-[24px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
            <EditableText value={mainHeading} isEditable={isEditable} onSave={handle('props.mainHeading.en')}  tag="h3" className="font-heading md:text-[46px] text-[32px] font-extrabold leading-[1.1] text-foreground tracking-tight" />
            <p className="text-foreground/70 font-medium mt-6 text-[18px] leading-relaxed">
              <EditableText value={description} isEditable={isEditable} onSave={handle('props.description.en')} tag="span" />
            </p>

            {listItems && listItems.length > 0 && (
              <div className="grid gap-4 mt-8">
                {listItems.map((li: any, idx: number) => {
                  const text = getV(li);
                  return (
                    <div
                      key={idx}
                      className="flex gap-3 items-start font-bold text-foreground/90 text-[16px]"
                    >
                      <div className="bg-secondary/10 p-1 rounded-full mt-0.5">
                        <CheckCircle2 className="text-secondary" size={16} strokeWidth={3} />
                      </div>
                      <EditableText value={text} isEditable={isEditable} onSave={handle(`content.${content.indexOf(listBlock)}.items.${idx}.en`)} tag="span" />
                    </div>
                  );
                })}
              </div>
            )}

            {buttons && buttons.length > 0 && (
              <div className="mt-[36px] flex gap-4 flex-wrap">
                {buttons.map((btn: any, i: number) => {
                  const label = getV(btn.label);
                  return (
                    <Link
                      key={i}
                      href={btn.link || "#"}
                      className={`px-[28px] h-14 rounded-full text-[14px] font-bold uppercase tracking-[1.5px] transition-all flex items-center shadow-sm hover:shadow-md hover:-translate-y-1 ${
                        i === 0
                        ? "bg-primary text-white hover:opacity-90"
                        : "bg-transparent border-2 border-foreground/20 text-foreground hover:border-foreground/40 hover:bg-foreground/5"
                      }`}
                    >
                      <EditableText value={label} isEditable={isEditable} onSave={handle(`content.${content.indexOf(buttonsBlock)}.items.${i}.label.en`)} tag="span" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Craft;
