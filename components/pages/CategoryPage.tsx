"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Star,
  Search,
  Filter,
  Heart,
  Eye,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";
import { AnnotatorPlugin } from "../annotationPlugin/AnnotatorPlugin";
import GetAllPages from "./GetAllPages";
import {
  useParams,
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";
import Link from "next/link";
import AccordionSection from "../category/accordionSection/AccordionSection";
import Pagination from "../category/Pagination";
import PageHead from "../category/pageHead/PageHead";
import { CategoryRecord } from "@/lib/store/categories/categoriesSlices";
import { generateBreadcrumbs } from "@/lib/utils";
import { useAppDispatch } from "@/lib/store/hooks";
import { updateProfileThunk } from "@/lib/store/auth/authThunks";
import { toast } from "sonner";
import {
  formatCommercePrice,
  resolveProductImage,
} from "@/lib/commerce/product-normalization";

const ProductCardSkeleton = () => (
  <div className="product-card animate-pulse">
    <div className="img-wrap bg-muted/20 aspect-square rounded-2xl mb-4"></div>
    <div className="card-body space-y-3">
      <div className="h-5 bg-muted/20 rounded w-3/4"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-muted/20 rounded w-20"></div>
        <div className="h-4 bg-muted/20 rounded w-16"></div>
      </div>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="mx-auto px-[5%] pb-20 pt-[50px]">
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-secondary mx-auto" />
        <p className="text-muted font-bold text-sm">Loading products...</p>
      </div>
    </div>
  </div>
);

/* ─── Main Page ──────────────────────────────────────────── */
const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const breadCrump = generateBreadcrumbs(pathname);

  const handleFilterChange = (key: string, value: string) => {
    const currentKey = `f_${key}`;
    const allparams = Object.fromEntries(searchParams.entries());
    delete allparams.page;
    const params = allparams[currentKey];
    if (params) {
      const values = params.split(",");
      if (values.includes(value)) {
        values.splice(values.indexOf(value), 1);
      } else {
        values.push(value);
      }
      allparams[currentKey] = values.join(",");
      if (values.length == 0) {
        delete allparams[currentKey];
      }
      router.push(`?${new URLSearchParams(allparams).toString()}`);
    } else {
      allparams[currentKey] = value;
      router.push(`?${new URLSearchParams(allparams).toString()}`);
    }
  };

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    Number(searchParams.get("perPage")) || 9,
  );

  const { allCategories, categoryLoading } = useSelector(
    (state: RootState) => state.adminCategories,
  );

  const {
    allProducts,
    loading,
    cmsFilters,
    totalProducts,
    loadingMore,
    hasFetched,
  } = useSelector((state: RootState) => state.adminProducts);

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const getCatIdStr = (cat: any) => {
    if (!cat) return "";
    if (typeof cat === "string") return cat;
    return cat.id || cat._id || "";
  };

  const getParentIdStr = (cat: any) => {
    if (!cat || !cat.parentId) return null;
    if (typeof cat.parentId === "string") return cat.parentId;
    return cat.parentId.id || cat.parentId._id || cat.parentId || null;
  };

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Trace up the tree to expand parent categories of the currently active category
  useEffect(() => {
    if (!id || allCategories.length === 0) return;

    const activeCat = allCategories.find((c: any) => c.slug === id);
    if (!activeCat) return;

    const newExpanded = { ...expandedCategories };
    let current = activeCat;

    while (current) {
      const pid = getParentIdStr(current);
      if (!pid) break;

      const parent = allCategories.find((c: any) => getCatIdStr(c) === pid);
      if (parent) {
        newExpanded[pid] = true;
        current = parent;
      } else {
        break;
      }
    }

    setExpandedCategories(newExpanded);
  }, [id, allCategories]); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite recursive renderer for category trees utilizing AccordionSection
  const renderCategoryTree = (
    categories: any[],
    parentId: string | null = null,
    depth: number = 0,
  ) => {
    const levelCats = categories.filter((c: any) => {
      const pid = getParentIdStr(c);
      if (parentId === null) {
        return pid == null;
      }
      return pid === parentId;
    });

    if (levelCats.length === 0) return null;

    // Outer level categories
    if (depth === 0) {
      return (
        <div className="border-t border-border/70 -mx-4 mt-2.5">
          {levelCats.map((cat: any) => {
            const catIdVal = getCatIdStr(cat);
            const hasChildren = categories.some(
              (c: any) => getParentIdStr(c) === catIdVal,
            );
            const isActive = id === cat.slug;
            const fontClass = "text-xs font-bold uppercase tracking-[1.5px]";

            const titleNode = (
              <Link
                href={`/category/${cat.slug}`}
                onClick={(e) => e.stopPropagation()}
                className={`hover:text-secondary transition-colors ${fontClass} ${
                  isActive ? "text-secondary font-black" : "text-foreground/80"
                }`}
              >
                {cat.title ? cat.title : cat.name}
              </Link>
            );

            if (hasChildren) {
              const isExpanded = !!expandedCategories[catIdVal];
              return (
                <AccordionSection
                  key={catIdVal}
                  title={titleNode as any}
                  isLast={false}
                  initialOpen={isExpanded}
                >
                  <div className="pl-2.5 py-1">
                    {renderCategoryTree(categories, catIdVal, depth + 1)}
                  </div>
                </AccordionSection>
              );
            }

            return (
              <div
                key={catIdVal}
                className="px-4 py-3.5 border-b border-border/70"
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className={`hover:text-secondary transition-colors ${fontClass} ${
                    isActive ? "text-secondary font-black" : "text-foreground/80"
                  }`}
                >
                  {cat.title ? cat.title : cat.name}
                </Link>
              </div>
            );
          })}
        </div>
      );
    }

    // Nested child categories (recursive depth > 0)
    return (
      <div className="space-y-2 border-l border-border/40 pl-3.5 ml-1 my-1.5">
        {levelCats.map((cat: any) => {
          const catIdVal = getCatIdStr(cat);
          const hasChildren = categories.some(
            (c: any) => getParentIdStr(c) === catIdVal,
          );
          const isActive = id === cat.slug;

          const fontClass =
            depth === 1 ? "text-xs font-bold" : "text-[11px] font-semibold";

          const titleNode = (
            <Link
              href={`/category/${cat.slug}`}
              onClick={(e) => e.stopPropagation()}
              className={`hover:text-secondary transition-colors ${fontClass} ${
                isActive ? "text-secondary font-black" : "text-muted"
              }`}
            >
              {cat.title ? cat.title : cat.name}
            </Link>
          );

          if (hasChildren) {
            const isExpanded = !!expandedCategories[catIdVal];
            return (
              <div key={catIdVal} className="space-y-1">
                <AccordionSection
                  title={titleNode as any}
                  isLast={true}
                  initialOpen={isExpanded}
                >
                  <div className="pl-1">
                    {renderCategoryTree(categories, catIdVal, depth + 1)}
                  </div>
                </AccordionSection>
              </div>
            );
          }

          return (
            <div key={catIdVal} className="py-0.5">
              <Link
                href={`/category/${cat.slug}`}
                className={`hover:text-secondary transition-colors ${fontClass} ${
                  isActive ? "text-secondary font-black" : "text-muted"
                }`}
              >
                {cat.title ? cat.title : cat.name}
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  const currentCategory = useMemo(() => {
    if (!id) return null;
    return allCategories.find((c: any) => c.slug === id);
  }, [id, allCategories]);

  const filteredProducts = useMemo(() => {
    let result = allProducts;

    if (currentCategory && currentCategory.id) {
      result = result.filter((p) =>
        p.categoryIds.includes(currentCategory?.id ?? ""),
      );
    }

    return result;
  }, [currentCategory, allProducts]);

  // Pagination calculations
  // const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));
  // const paginatedProducts = filteredProducts;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const missingCount = loadingMore
    ? Math.min(itemsPerPage, Math.max(0, endIndex - filteredProducts.length))
    : 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("perPage", items.toString());
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const wishlistIds: string[] =
    isAuthenticated && user?.wishlist ? user.wishlist : [];

  const handleWishlist = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id || !product.id) {
      return;
    }
    let copiedList = [...wishlistIds];

    const exists = copiedList.includes(product.id);
    if (exists) {
      copiedList = copiedList.filter((id) => id !== product.id);
    } else {
      copiedList.push(product.id);
    }

    const res = await dispatch(
      updateProfileThunk({
        userData: { wishlist: copiedList },
      }),
    );

    if (res.payload.success) {
      toast.success("Wishlist updated successfully");
    } else {
      toast.error("Failed to update wishlist");
    }
  };

  useEffect(() => {
    setCurrentPage(Number(searchParams.get("page")) || 1);
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  if (categoryLoading) {
    return <LoadingState />;
  }

  return (
    <>
      {/* Comments Plugin */}

      {/* get all page from the database */}
      <GetAllPages />
      <div className="mx-auto px-[5%] pb-20 pt-[50px]">
        {/* Breadcrumbs */}
        <div className="crumbs flex items-center gap-2">
          <Link href="/">Home</Link>{" "}
          <ChevronRight size={12} className="opacity-50" />
          {breadCrump.length > 0 &&
            breadCrump.map((d, index) => {
              return (
                <React.Fragment key={index}>
                  <Link href={d.href}>{d.label}</Link>{" "}
                  {index != breadCrump.length - 1 && (
                    <ChevronRight size={12} className="opacity-50" />
                  )}
                </React.Fragment>
              );
            })}
        </div>

        {/* Header */}
        <PageHead
          currentCategory={currentCategory as CategoryRecord}
          productCount={filteredProducts.length}
        />

        {/* Content Layout */}
        <section className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
            {/* LEFT FILTERS */}
            <aside className="lg:sticky lg:top-[128px] space-y-6">
              {/* Container 1: Category & Rating Filters */}
              <div className="border border-border bg-surface rounded-[20px] overflow-hidden shadow-sm">
                {/* Filter header */}
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-secondary" />
                    <h3 className="text-[26px] font-black leading-none">
                      Filters
                    </h3>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[2px] text-muted border border-border rounded-full px-2.5 py-1.5 bg-background">
                    {currentCategory && currentCategory.title
                      ? currentCategory.title
                      : "All"}
                  </span>
                </div>

                {/* ── Category filter ── */}
                <AccordionSection
                  adminTitle="Category"
                  title="Category"
                  initialOpen={true}
                  isPrimary={true}
                  colorVariant="category"
                  isLast={false}
                >
                  <div className="space-y-2.5">
                    <Link
                      href="/shop"
                      className={`flex justify-between items-center text-sm font-bold hover:text-secondary transition-colors ${
                        !id || id === "all" ? "text-secondary" : "text-muted"
                      }`}
                    >
                      All Products
                    </Link>
                    {allCategories.length > 0 &&
                      renderCategoryTree(allCategories)}
                  </div>
                </AccordionSection>

                {/* ── Rating filter ── */}
                <AccordionSection
                  adminTitle="Rating"
                  title="Rating"
                  isLast={true}
                  initialOpen={true}
                  isPrimary={true}
                  colorVariant="rating"
                >
                  <div className="space-y-2.5">
                    {[4, 3, 2, 1].map((rating) => (
                      <label
                        key={rating}
                        className="flex items-center gap-2.5 text-sm font-bold text-foreground/80 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-secondary"
                        />
                        <span className="flex items-center gap-1">
                          <Star
                            size={11}
                            className="text-amber-500 fill-amber-500"
                          />
                          {rating}+
                        </span>
                      </label>
                    ))}
                  </div>
                </AccordionSection>
              </div>

              {/* Container 2: Product Filters (CMS Attribute Filters) */}
              {cmsFilters && cmsFilters.length > 0 && (
                <div className="border border-border bg-surface rounded-[20px] overflow-hidden shadow-sm">
                  {/* Product Filters header */}
                  <div className="p-4 border-b border-border flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Filter size={18} className="text-foreground/60" />
                      <h3 className="text-[22px] font-black leading-none">
                        Product Filters
                      </h3>
                    </div>
                  </div>

                  {/* ── Dynamic CMS attribute filters ── */}
                  {cmsFilters.map((filter: any, index: number) => {
                    const key = `f_${filter.key}`;
                    const values = searchParams.get(key);

                    const arrayofValues = values
                      ? values.split(",").map((d) => d.toLowerCase())
                      : [];

                    const isLastCms = index === cmsFilters.length - 1;

                    return (
                      <AccordionSection
                        key={filter._id || filter.key}
                        adminTitle={filter.label}
                        title={filter.label}
                        isLast={isLastCms}
                      >
                        <div className="space-y-2.5">
                          {filter.selectedValues?.map((value: string) => (
                            <label
                              key={value}
                              className="flex items-center gap-2.5 text-sm font-bold text-foreground/80 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={arrayofValues.includes(
                                  value.toLowerCase(),
                                )}
                                onChange={() =>
                                  handleFilterChange(filter.key, value)
                                }
                                className="w-4 h-4 accent-secondary"
                              />
                              {value}
                            </label>
                          ))}
                        </div>
                      </AccordionSection>
                    );
                  })}
                </div>
              )}
            </aside>

            {/* RIGHT GRID */}
            <div>
              {/* Search and Sort Bar */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
                <div className="relative w-full sm:max-w-md">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search in this category..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full h-12 pl-12 pr-6 rounded-2xl border border-border bg-surface font-bold focus:border-secondary outline-none transition-all text-sm"
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-[11px] font-black uppercase tracking-[1px] text-muted whitespace-nowrap">
                    Sort by:
                  </span>
                  <select className="h-12 px-4 rounded-2xl border border-border bg-surface font-bold text-sm outline-none focus:border-secondary cursor-pointer w-full sm:w-48">
                    <option>Newest First</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Most Popular</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {loading || !hasFetched ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: itemsPerPage }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedProducts?.map((product) => {
                      const isWishList = product.id
                        ? wishlistIds.includes(product.id)
                        : false;

                      return (
                        <div key={product.id} className="product-card group">
                          {/* <div className="badge">{product.badge}</div> */}
                          <Link
                            href={`/product/${product.slug}`}
                            className="img-wrap block"
                          >
                            <img
                              src={resolveProductImage(product)}
                              alt={
                                product?.gallery?.[0]?.alt ||
                                product?.name ||
                                ""
                              }
                            />
                          </Link>
                          <div className="card-body">
                            <div className="flex justify-between items-start mb-2.5">
                              <Link
                                href={`/product/${product.slug}`}
                                className="font-heading text-[20px] font-black leading-[1.05] text-foreground/92 hover:text-secondary transition-colors"
                              >
                                {product.name}
                              </Link>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => handleWishlist(e, product)}
                                  className="flex h-10 w-10 items-center justify-center
                                         rounded-full border border-border bg-white shadow-lg
                                        opacity-0 transition-all duration-300 group-hover:opacity-100
                                          hover:scale-110 shrink-0"
                                  title="Wishlist"
                                >
                                  <Heart
                                    size={18}
                                    className={
                                      isWishList
                                        ? "text-red-500 fill-red-500"
                                        : "text-foreground"
                                    }
                                  />
                                </button>

                                <button
                                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:text-secondary shrink-0"
                                  title="Quick View"
                                >
                                  <Eye size={18} />
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center gap-2.5 flex-wrap font-black tracking-[1px] text-foreground/75">
                              <span className="text-black text-[13px] uppercase tracking-[2px]">
                                {formatCommercePrice(
                                  product.price,
                                  (product as any).currency || "INR",
                                )}
                              </span>
                              {/* <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[2px] text-primary whitespace-nowrap">
                              <Star
                                size={12}
                                className="text-secondary fill-secondary"
                              />{" "}
                              {product.rating.toFixed(1)}
                            </span> */}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {Array.from({ length: missingCount }).map((_, i) => (
                      <ProductCardSkeleton key={`loading-${i}`} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {/* {paginatedProducts.length > 0 && totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                      onItemsPerPageChange={handleItemsPerPageChange}
                    />
                  )} */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={itemsPerPage}
                      onItemsPerPageChange={handleItemsPerPageChange}
                    />
                  )}
                </>
              )}

              {/* Empty State */}
              {filteredProducts.length === 0 &&
                !loading &&
                !loadingMore &&
                hasFetched && (
                  <div className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/10 mb-6">
                      <Search size={32} className="text-muted" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      No products found
                    </h3>
                    <p className="text-muted font-semibold mb-8">
                      We couldn&apos;t find any products matching your search.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        const params = new URLSearchParams(
                          searchParams.toString(),
                        );
                        params.delete("search");
                        params.set("page", "1");
                        router.push(`?${params.toString()}`);
                      }}
                      className="text-secondary font-black text-xs uppercase tracking-[2px] border-b border-secondary pb-1"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CategoryPage;
