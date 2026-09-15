"use client";
import { useMemo } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import MainHeroSlider from "./MainHeroSlider";

const Hero = ({ section: propSection }: { section?: any }) => {
  const currentPages = useAppSelector((state) => state.pages.currentPages);

  const section = useMemo(() => {
    if (!currentPages) return propSection;
    return currentPages.content?.find(
      (page: any) =>
        page?.id === propSection?.id ||
        page.adminTitle === "Premium Hero Slider" ||
        page.adminTitle === "Hero" ||
        page.id === "sec-hero" ||
        page.type === "nestcraft.hero.carousel"
    ) || propSection;
  }, [propSection, currentPages]);

  return (
    <section data-annotate-id="home-hero-section">
      <MainHeroSlider initialSlides={Array.isArray(section?.content) ? section.content : section?.content?.items} />
    </section>
  );
};

export default Hero;
