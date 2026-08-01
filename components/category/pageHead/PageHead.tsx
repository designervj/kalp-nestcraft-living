"use client";

import {
  CategoryRecord,
  CategoryType,
} from "@/lib/store/categories/categoriesSlices";
import React, { useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";

import { defaultSubCategories, defaultPills } from "./pageHeadData";
import Link from "next/link";

interface PageHeadProps {
  currentCategory: CategoryRecord | null;
  productCount: number;
  section?: any;
}

interface TreeCategory extends CategoryRecord {
  children: TreeCategory[];
}

const PageHead = ({
  currentCategory,
  productCount,
  section: propSection,
}: PageHeadProps) => {
  const pathname = usePathname();
  const currentPages = useAppSelector((state) => state.pages.currentPages);

  const category = useParams();
  const id = category.id;

  const { allCategories, categoryLoading } = useAppSelector(
    (state) => state.adminCategories,
  );

  const parent = id !== "all" ? allCategories.find((d) => d.slug == id) : "all";

  const tree = useMemo(() => {
    const map = new Map<string, TreeCategory>();
    const roots: TreeCategory[] = [];

    allCategories.forEach((c) => {
      const id = c._id || c.id;
      if (id) map.set(id, { ...c, children: [] });
    });

    map.forEach((c) => {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children.push(c);
      } else {
        roots.push(c);
      }
    });

    return roots;
  }, [allCategories]);

  const similar =
    parent != "all"
      ? parent?.parentId != null
        ? parent.parentId
        : parent?.id
      : null;

  const isShopPage = useMemo(() => {
    return pathname.split("/").filter(Boolean).includes("shop");
  }, [pathname]);

  const finalAllChildren = similar
    ? tree.find((d) => d.id == similar)
    : isShopPage
    ? { children: tree }
    : tree[0];

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "hi") return "hi";
    return "en";
  }, [pathname]);

  const { totalProducts } = useAppSelector((state) => state.adminProducts);

  const getCurrentSection = useMemo(() => {
    if (!currentPages) return;
    return currentPages.content?.find(
      (page: any) => page?.adminTitle === "Category Page Head",
    );
  }, [currentPages]);

  const section = propSection || getCurrentSection;
  const p = section?.props || {};

  // Extract content with fallbacks
  const badge =
    p.badge?.[lang] ||
    p.badge?.en ||
    p.badge ||
    (currentCategory ? "Category" : "Collection");
  const heading =
    p.heading?.[lang] ||
    p.heading?.en ||
    p.heading ||
    (currentCategory ? currentCategory.name : "The Full Collection");
  const description =
    p.description?.[lang] ||
    p.description?.en ||
    p.description ||
    (currentCategory
      ? currentCategory.description
      : "Explore our entire range of design-led furniture and home essentials. Crafted with purpose, built for life.");

  const subCategories = section?.content || defaultSubCategories;

  const pills = p.pills || defaultPills(productCount);

  const displayBadge = isShopPage ? "Collection" : badge;
  const displayTitle = isShopPage
    ? "Shop"
    : parent && parent !== "all"
    ? parent.name
    : "All Products";
  const displayDescription = isShopPage
    ? "Explore our entire range of design-led furniture and home essentials. Crafted with purpose, built for life."
    : parent && parent !== "all"
    ? parent.description
    : "Explore our entire range of design-led furniture and home essentials. Crafted with purpose, built for life.";

  return (
    <section className="pagehead">
      <div className="pagehead-inner">
        <div className="pagehead-content">
          <small className="text-secondary tracking-[3px] uppercase text-[10px] font-black mb-2 block">
            {displayBadge}
          </small>
          <h1 className="text-[46px] font-black leading-[1.05] tracking-tight">
            {displayTitle}
          </h1>
          <p className="text-muted font-bold mt-2.5 max-w-[70ch] leading-relaxed">
            {displayDescription}
          </p>

          <div className="flex flex-wrap gap-2.5 mt-4">
            {finalAllChildren &&
              finalAllChildren.children &&
              finalAllChildren.children.length > 0 &&
              finalAllChildren.children.map((sub: any, idx: number) => {
                const subTitle =
                  typeof sub === "string"
                    ? sub
                    : sub.props?.label?.[lang] ||
                      sub.props?.label?.en ||
                      sub.props?.title?.[lang] ||
                      sub.props?.title?.en ||
                      sub.name ||
                      "";
                if (!subTitle) return null;
                return (
                  <Link
                    key={idx}
                    href={`/category/${sub.slug}`}
                    className="h-10 px-4 rounded-full
                    border border-border bg-white/65 dark:bg-surface/62 backdrop-blur-md text-[10px] font-black
                     uppercase tracking-[2px] hover:border-secondary hover:bg-secondary/10 transition-all flex items-center justify-center"
                  >
                    {subTitle}
                  </Link>
                );
              })}
          </div>
        </div>

        <div className="flex gap-2.5 flex-wrap justify-start lg:justify-end ml-auto">
          {/* {pills.map((pill: any, idx: number) => {
            const pillLabel = typeof pill.label === "object"
              ? (pill.label[lang] || pill.label.en)
              : pill.label;
            return (
              <div key={idx} className="pill">
                {pill.isBold ? <b>{pill.value}</b> : pill.value} {pillLabel}
              </div>
            );
          })} */}
          <div className="pill">
            {totalProducts} {totalProducts === 1 ? "Product" : "Products"}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageHead;
