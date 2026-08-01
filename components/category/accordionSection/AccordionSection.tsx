"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";

interface AccordionSectionProps {
    title?: string | React.ReactNode;
    children: React.ReactNode;
    isLast?: boolean;
    adminTitle?: string;
    section?: any;
    initialOpen?: boolean;
    isPrimary?: boolean;
    colorVariant?: "category" | "rating" | "default";
}

const AccordionSection = ({
    title: propTitle,
    children,
    isLast: propIsLast = false,
    adminTitle,
    section: propSection,
    initialOpen = false,
    isPrimary = false,
    colorVariant = "default"
}: AccordionSectionProps) => {
    const [open, setOpen] = useState(initialOpen);

    useEffect(() => {
        setOpen(initialOpen);
    }, [initialOpen]);

    const pathname = usePathname();
    const currentPages = useAppSelector((state) => state.pages.currentPages);

    const lang = useMemo(() => {
        const segments = pathname.split("/").filter(Boolean);
        if (segments[0] === "hi") return "hi";
        return "en";
    }, [pathname]);

    const getCurrentSection = useMemo(() => {
        if (!currentPages || !adminTitle) return;
        return currentPages.content?.find((page: any) => page?.adminTitle === adminTitle);
    }, [currentPages, adminTitle]);

    const section = propSection || getCurrentSection;
    const p = section?.props || {};

    const title = p.title?.[lang] || p.title?.en || p.title || propTitle || "";
    const isLast = p.isLast ?? propIsLast;

    const isTitleString = typeof title === "string";

    const isCategory = colorVariant === "category" || (isPrimary && colorVariant === "default");
    const isRating = colorVariant === "rating";

    return (
        <div
            className={`transition-all duration-300 ${
                isPrimary
                    ? isCategory
                        ? "bg-secondary/[0.04] dark:bg-secondary/[0.015] border-l-4 border-l-secondary"
                        : "bg-amber-500/[0.04] dark:bg-amber-500/[0.015] border-l-4 border-l-amber-500"
                    : ""
            } ${isLast ? "" : "border-b border-border/70"}`}
        >
            <button
                onClick={() => setOpen((o) => !o)}
                className={`w-full flex justify-between items-center transition-all duration-300 ${
                    isPrimary
                        ? isCategory
                            ? "pl-3 pr-4 py-4 hover:bg-secondary/[0.08]"
                            : "pl-3 pr-4 py-4 hover:bg-amber-500/[0.08]"
                        : "px-4 py-3.5 hover:bg-border/20"
                }`}
            >
                {isPrimary && isTitleString ? (
                    <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            isCategory
                                ? "bg-secondary shadow-[0_0_8px_rgba(152,196,95,0.6)]"
                                : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                        }`} />
                        <span className="text-[11.5px] font-black uppercase tracking-[2px] text-foreground">
                            {title}
                        </span>
                    </span>
                ) : isTitleString ? (
                    <span className="text-[11px] font-black uppercase tracking-[2px] text-foreground/80">
                        {title}
                    </span>
                ) : (
                    title
                )}
                <ChevronRight
                    size={15}
                    className={`${
                        isPrimary && isRating ? "text-amber-500" : "text-secondary"
                    } transition-transform duration-300 ${open ? "rotate-90" : ""}`}
                />
            </button>

            <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: open ? "800px" : "0px", opacity: open ? 1 : 0 }}
            >
                <div className={isPrimary ? "pl-[30px] pr-4 pb-4" : "px-4 pb-4"}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AccordionSection;