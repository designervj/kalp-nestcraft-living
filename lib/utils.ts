import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isHex(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function generateBreadcrumbs(path:string) {
  const segments = path.split("/").filter(Boolean);

  return segments.map((segment, index) => ({
    label: segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase()),
    href: "/" + segments.slice(0, index + 1).join("/"),
  }));
}