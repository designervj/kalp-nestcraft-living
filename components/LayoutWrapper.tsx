"use client";
import { usePathname } from "next/navigation";
import SiteChrome from "./SiteChrome";
import StudioPreviewBridge from "./StudioPreviewBridge";

export default function LayoutWrapper({
  children,
  brandConfig,
}: {
  children: React.ReactNode;
  brandConfig: any;
}) {
  const pathname = usePathname();

  // If we are in the admin panel, auth pages, or kalp-admin/kalp-admi SSO routes, do not render the storefront header and footer
  const segments = pathname?.split("/") || [];
  const isExcluded =
    segments.some(
      (s) =>
        s === "admin" ||
        s === "login" ||
        s === "signup" ||
        s === "kalpauth" ||
        s === "kalp-admin" ||
        s === "kalp-admi",
    ) ||
    Boolean(pathname?.includes("kalp-admin")) ||
    Boolean(pathname?.includes("kalp-admi"));

  if (isExcluded) {
    return <>{children}</>;
  }

  // Otherwise, wrap children in the standard NestCraft header and footer
  return <SiteChrome brandConfig={brandConfig}><StudioPreviewBridge />{children}</SiteChrome>;
}
