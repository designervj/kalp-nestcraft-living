// Reverse lookup: "/product" -> "shop"
export function resolvePermalink(
  pathname: string,
  permalinks: Record<string, string>,
) {
  const segments = pathname.split("/").filter(Boolean); // ["product", "red-shoes"]
  const base = "/" + segments[0];

  const entry = Object.entries(permalinks).find(([, path]) => path === base);

  if (!entry) return null;

  return {
    type: entry[0], // "shop" | "category" | "blog"
    slug: segments.slice(1), // remaining segments, e.g. ["red-shoes"]
  };
}
