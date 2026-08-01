"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const PROTOCOL = "kalp.studio.selection.v1";
const SELECTORS = new Set([
  "[data-annotate-id='home-hero-section']",
  "[data-annotate-id='home-usp-section']",
  "[data-annotate-id='home-services-section']",
  "[data-annotate-id='home-collections-section']",
  "[data-annotate-id='home-shop-by-room-section']",
  "[data-annotate-id='home-featured-banner']",
  "[data-annotate-id='home-product-slider-section']",
  "[data-annotate-id='home-craft-section']",
  "[data-annotate-id='home-testimonials-section']",
  "[data-annotate-id='home-blog-section']",
  "[data-annotate-id='home-faq-section']",
  "[data-annotate-id='home-newsletter-section']",
  "[data-annotate-id='home-instagram-gallery-section']",
  "[data-annotate-id='home-cta-section']",
]);

function allowedParent(origin: string) {
  const configured = (process.env.NEXT_PUBLIC_STUDIO_PREVIEW_ORIGINS || "")
    .split(",").map((item) => item.trim()).filter(Boolean);
  return configured.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

export default function StudioPreviewBridge() {
  const params = useSearchParams();
  useEffect(() => {
    if (params.get("studioPreview") !== "1" || window.parent === window) return;
    const parentOrigin = document.referrer ? new URL(document.referrer).origin : "";
    if (!allowedParent(parentOrigin)) return;

    const clear = () => document.querySelectorAll<HTMLElement>("[data-kalp-studio-selected]").forEach((node) => {
      node.removeAttribute("data-kalp-studio-selected");
      node.style.removeProperty("outline");
      node.style.removeProperty("outline-offset");
    });
    const select = (selector: string, scroll = true) => {
      if (!SELECTORS.has(selector)) return;
      clear();
      const node = document.querySelector<HTMLElement>(selector);
      if (!node) return;
      node.dataset.kalpStudioSelected = "true";
      node.style.outline = "3px solid #84cc16";
      node.style.outlineOffset = "-3px";
      if (scroll) node.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    const receive = (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== parentOrigin) return;
      if (event.data?.protocol === PROTOCOL && event.data.type === "select" && SELECTORS.has(event.data.selector)) {
        select(event.data.selector);
      }
    };
    const click = (event: MouseEvent) => {
      const marker = (event.target as Element | null)?.closest<HTMLElement>("[data-annotate-id]");
      if (!marker) return;
      const selector = `[data-annotate-id='${marker.dataset.annotateId}']`;
      if (!SELECTORS.has(selector)) return;
      event.preventDefault();
      event.stopPropagation();
      select(selector, false);
      window.parent.postMessage({ protocol: PROTOCOL, type: "select", selector }, parentOrigin);
    };
    window.addEventListener("message", receive);
    document.addEventListener("click", click, true);
    const handshake = document.querySelector<HTMLElement>("[data-kalp-studio-preview-id]");
    window.parent.postMessage({
      protocol: PROTOCOL,
      type: "ready",
      mode: handshake ? "draft" : "live",
      changeSetId: handshake?.dataset.kalpStudioPreviewId || null,
      expiresAt: handshake?.dataset.kalpStudioPreviewExpires || null,
      pageChecksum: handshake?.dataset.kalpStudioPageChecksum || null,
      themeChecksum: handshake?.dataset.kalpStudioThemeChecksum || null,
    }, parentOrigin);
    return () => {
      clear();
      window.removeEventListener("message", receive);
      document.removeEventListener("click", click, true);
    };
  }, [params]);
  return null;
}
