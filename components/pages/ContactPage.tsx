"use client";

import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Twitter, CheckCircle2, ArrowRight, Globe, Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { AnnotatorPlugin } from '../annotationPlugin/AnnotatorPlugin';
import { ContactForm } from '../contactpage/contactForm/ContactForm';
import ContactHero from '../contactpage/contactHero/ContactHero';
import { FAQ } from '../contactpage/faq/FAQ';
import { usePathname } from 'next/navigation';
import { Page } from '@/lib/store/pages/pageType';
import { setCurrentPages } from '@/lib/store/pages/pagesSlice';
import EditableText from '../shared/EditableText';
import PageDataInitializer from './PageDataInitializer';

const ContactPage = ({ initialData }: { initialData?: Page | null }) => {
  const { user: nestCraftUser } = useSelector((state: RootState) => state.auth);
  const { allPages, currentPages } = useSelector((state: RootState) => state.pages);
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).pop() || "contact";

  const dispatch = useDispatch();

  useEffect(() => {
    if (!initialData && allPages && allPages.length > 0 && slug) {
      const currentPage = allPages.find((item: Page) => item.slug === slug);
      if (currentPage) {
        dispatch(setCurrentPages(currentPage));
      }
    }
  }, [allPages, slug, dispatch, initialData]);

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const content = currentPages?.content || [];

  const getSection = (content: any[], title: string) => {
    return content?.find(
      (s: any) => s.adminTitle?.toLowerCase() === title.toLowerCase()
    );
  };

  const showroomSection = getSection(content, "Contact Showroom");
  const showProps = showroomSection?.props || {};

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object" && !Array.isArray(val))
      return val[lang] || val.en || "";
    return val || "";
  };

  const showroomTitle = getV(showProps.showroomTitle) || "Visit the Showroom";
  const showroomDesc = getV(showProps.showroomDesc) || "Experience premium furniture and free design consultations at our Raja Park showroom. Feel the quality of our craftsmanship in person.";
  const showroomHours = getV(showProps.showroomHours) || "Mon - Sat: 10:30 - 9:00";
  const mapLink = getV(showProps.mapLink) || "https://share.google/UcBYZ8kXdPXVpuhBt";

  return (
    <>
      {/* commentsS Plugin */}
      {nestCraftUser?.role === "admin" && <AnnotatorPlugin />}

      <PageDataInitializer initialData={initialData || null} />
      <div className="bg-background">
        {/* Editorial Hero Section */}
        <ContactHero />

        {/* Main Contact Section */}
        <ContactForm />

        {/* FAQ Section */}
        <FAQ />

        {/* Map Section - Modern & Glassmorphic */}
        <section className="w-full -mb-20 relative z-20">
          <div className="relative h-[500px] md:h-[650px] w-full overflow-hidden border-b border-border/50">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3558.1622708907225!2d75.82064262512074!3d26.89834471070848!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db74615ffdb4d%3A0x21afdb4e447341f4!2sNestCraft%20Living!5e0!3m2!1sen!2sin!4v1776761345663!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              loading="lazy" 
              className="border-0"
            ></iframe>
            
            {/* Showroom Hover Card */}
            <div className="absolute bottom-6 left-[5%] right-[5%] md:bottom-12 flex flex-col md:flex-row justify-between items-end gap-6 md:gap-8 z-20 pointer-events-none">
              <div className="bg-surface/90 backdrop-blur-2xl p-8 md:p-10 rounded-[32px] md:rounded-[40px] border border-border/50 max-w-md shadow-xl pointer-events-auto">
                <EditableText value={showroomTitle}
                    currentPages={currentPages}
                    sectionId={showroomSection?.id}
                    fieldPath="props.showroomTitle" tag="h4" className="text-2xl md:text-3xl font-black mb-4 tracking-tight text-[#063A1D]" />
                <div className="font-medium mb-6 leading-relaxed text-[#063A1D]/80">
                  <EditableText
                    value={showroomDesc}
                    currentPages={currentPages}
                    sectionId={showroomSection?.id}
                    fieldPath="props.showroomDesc"
                    tag="p"
                  />
                </div>
                <div className="flex items-center gap-3 text-[#063A1D] font-black uppercase tracking-widest text-[11px] md:text-xs">
                  <Clock size={18} strokeWidth={2.5} />
                  <div className="[&_*]:!text-[#063A1D]">
                    <EditableText
                      value={showroomHours}
                      currentPages={currentPages}
                      sectionId={showroomSection?.id}
                      fieldPath="props.showroomHours"
                    />
                  </div>
                </div>
              </div>

              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-20 h-20 md:w-24 md:h-24 bg-[#063A1D] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-500 pointer-events-auto border-4 border-white/20 backdrop-blur-sm"
              >
                <MapPin size={32} strokeWidth={2} />
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;
