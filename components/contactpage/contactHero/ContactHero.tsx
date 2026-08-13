"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { defaultContactHeroData } from "./contactHeroData";
import EditableText from "@/components/shared/EditableText";

const ContactHero = ({ section }: { section?: any }) => {
  const pathname = usePathname();
  const { currentPages } = useAppSelector((state) => state.pages);

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const currentSection = useMemo(() => {
    return (
      section ||
      currentPages?.content?.find((s: any) => s?.adminTitle === "Contact Hero")
    );
  }, [section, currentPages]);

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object" && !Array.isArray(val))
      return val[lang] || val.en || "";
    return val || "";
  };

  const p = currentSection?.props || defaultContactHeroData.props;

  const subtitle = getV(p.subtitle);
  const headingLine1 = getV(p.headingLine1);
  const headingLine2 = getV(p.headingLine2);
  const description = getV(p.description);
  const showroomLabel = getV(p.showroomLabel);
  const showroomLocation = getV(p.showroomLocation);
  const supportLabel = getV(p.supportLabel);
  const supportHours = getV(p.supportHours);
  const badgeLine1 = getV(p.badgeLine1);
  const badgeLine2 = getV(p.badgeLine2);
  const badgeLine3 = getV(p.badgeLine3);
  const bgImage = getV(p.bgImage) || defaultContactHeroData.props.bgImage;
  const mainImage = getV(p.mainImage) || defaultContactHeroData.props.mainImage;

  return (
    <section
      data-annotate-id="contact-hero-section"
      className="relative min-h-[85vh] flex items-center px-[5%] overflow-hidden bg-background"
    >
      {/* Background Orbs & Glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Office"
          className="w-full h-full object-cover opacity-[0.03] grayscale mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-surface border border-border/50 shadow-sm backdrop-blur-md">
              <p className="text-secondary uppercase tracking-[4px] text-[11px] font-black">
                <EditableText
                  value={subtitle}
                  currentPages={currentPages}
                  sectionId={currentSection?.id}
                  fieldPath="props.subtitle"
                />
              </p>
            </div>
            
            <h1 className="text-[56px] md:text-[72px] lg:text-[88px] font-black leading-[1.05] tracking-tighter mb-8 text-foreground ">
              <EditableText
                value={headingLine1}
                currentPages={currentPages}
                sectionId={currentSection?.id}
                fieldPath="props.headingLine1"
                tag="span"
              />{" "}
              <br className="hidden md:block" />{" "}
              <span className="text-secondary italic font-serif font-normal">
                <EditableText
                  value={headingLine2}
                  currentPages={currentPages}
                  sectionId={currentSection?.id}
                  fieldPath="props.headingLine2"
                  tag="span"
                />
              </span>
            </h1>
            <div className="text-lg md:text-xl text-muted font-medium max-w-[500px] leading-relaxed">
              <EditableText
                value={description}
                currentPages={currentPages}
                sectionId={currentSection?.id}
                fieldPath="props.description"
                tag="p"
              />
            </div>

            <div className="mt-12 flex flex-wrap gap-8 md:gap-12 p-8 rounded-3xl bg-surface/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col group">
                <span className="text-[10px] font-black uppercase tracking-[3px] text-muted mb-2 group-hover:text-primary transition-colors">
                  <EditableText
                    value={showroomLabel}
                    currentPages={currentPages}
                    sectionId={currentSection?.id}
                    fieldPath="props.showroomLabel"
                  />
                </span>
                <span className="font-bold text-lg text-foreground">
                  <EditableText
                    value={showroomLocation}
                    currentPages={currentPages}
                    sectionId={currentSection?.id}
                    fieldPath="props.showroomLocation"
                  />
                </span>
              </div>
              <div className="hidden md:block w-px h-12 bg-border/60" />
              <div className="flex flex-col group">
                <span className="text-[10px] font-black uppercase tracking-[3px] text-muted mb-2 group-hover:text-secondary transition-colors">
                  <EditableText
                    value={supportLabel}
                    currentPages={currentPages}
                    sectionId={currentSection?.id}
                    fieldPath="props.supportLabel"
                  />
                </span>
                <span className="font-bold text-lg text-foreground">
                  <EditableText
                    value={supportHours}
                    currentPages={currentPages}
                    sectionId={currentSection?.id}
                    fieldPath="props.supportHours"
                  />
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block relative"
          >
            {/* Image Glass Card */}
            <div className="relative aspect-[4/5] rounded-[40px] p-4 bg-surface/30 backdrop-blur-3xl border border-white/20 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-all duration-700 group hover:-translate-y-4">
              <div className="w-full h-full rounded-[28px] overflow-hidden relative">
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-700" />
                <img
                  src={mainImage}
                  alt="Studio"
                  className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-[1.5s]"
                />
              </div>
              
              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-secondary to-primary rounded-full flex flex-col items-center justify-center text-white p-6 text-center leading-tight font-black uppercase tracking-widest text-[10px] shadow-2xl border-4 border-background"
              >
                <EditableText
                  value={badgeLine1}
                  currentPages={currentPages}
                  sectionId={currentSection?.id}
                  fieldPath="props.badgeLine1"
                />
                <EditableText
                  value={badgeLine2}
                  currentPages={currentPages}
                  sectionId={currentSection?.id}
                  fieldPath="props.badgeLine2"
                />
                <EditableText
                  value={badgeLine3}
                  currentPages={currentPages}
                  sectionId={currentSection?.id}
                  fieldPath="props.badgeLine3"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
