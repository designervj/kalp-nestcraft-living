"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  ShoppingCart,
  Moon,
  Sun,
  Menu,
  Home,
  X,
  ArrowUp,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Phone,
  Building2,
  Truck,
  HelpCircle,
  Store,
  User,
  Heart,
  Users,
  Wrench,
  ShieldCheck,
  ClipboardList,
  ChevronRight,
  LogOut,
  Package,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { selectCartCount } from "@/lib/store/cart/cartSlice";
import { products } from "@/data/products";
import { fetchMenusThunk } from "@/lib/store/menus/menusThunk";
import { AppDispatch, RootState } from "@/lib/store/store";
import { useDispatch } from "react-redux";
import { wsCategories } from "./cms/menus/constMenus";
import { toast } from "sonner";
import { profile } from "console";
import { logoutThunk } from "@/lib/store/auth/authThunks";
import { fetchProducts } from "@/lib/store/products/productsThunk";
import { Button } from "./ui/button";
import AdminBar from "./AdminBar";
import { resolveProductImage } from "@/lib/commerce/product-normalization";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import CartSidebar from "./ecommerce/CartSidebar";

// --- Types ---
export type MegaMenuLink = { title: string; href: string };
export type MegaMenuSection = { heading: string; links: MegaMenuLink[] };
export type MegaMenuColumn = { sections: MegaMenuSection[] };

type ShopMegaTab = {
  key: string;
  title: string;
  isLuxe?: boolean;
  isModular?: boolean;
  columns?: MegaMenuColumn[];
  promo?: {
    img: string;
    href: string;
    title?: string;
    subtitle?: string;
    badge?: string;
  };
};

const DEFAULT_LOGO = "/assets/Image/nestcraft-logo.svg";

const normalizeLogoUrl = (raw?: string) => {
  if (!raw || typeof raw !== "string") return DEFAULT_LOGO;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
    return DEFAULT_LOGO;
  }
  return trimmed;
};

// --- 3-Tier Header Component ---
const Header = ({
  theme,
  toggleTheme,
  onSearchOpen,
  logoUrl,
  companyName,
  setIsCartSidebarOpen,
  isScrolled,
  isScrollingDown,
}: {
  theme: string;
  toggleTheme: () => void;
  onSearchOpen: () => void;
  logoUrl?: string;
  companyName?: string;
  setIsCartSidebarOpen: (val: boolean) => void;
  isScrolled: boolean;
  isScrollingDown: boolean;
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaTab, setActiveMegaTab] = useState<string | null>(null);
  const cartCount = useAppSelector(selectCartCount);
  const pathname = usePathname();
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const { allMenus, isFetchedMenus } = useAppSelector((state) => state.menus);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const wishlistCount = (user! && user?.wishlist && user.wishlist.length) || 0;

  const handleLogout = async () => {
    try {
      const data = await dispatch(logoutThunk()).unwrap();

      if (data.success) {
        router.push("/login"); // or "/"
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isFetchedMenus) {
      dispatch(fetchMenusThunk());
    }
  }, [dispatch, isFetchedMenus]);

  const displayMenus =
    allMenus && allMenus.length > 0 ? allMenus : wsCategories;
  const activeTab = displayMenus.find((tab) => tab.key === activeMegaTab);

  const [hasColumns, setHasColumns] = useState<boolean>(false);
  const [expandedDrawerTab, setExpandedDrawerTab] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveMegaTab(null);
  }, [pathname]);


  const isHome = pathname === "/" || pathname === "/en" || pathname === "/hi";
  const isTransparent =
    isHome && !isScrolled && !activeMegaTab && !isMobileMenuOpen;

  const textColor = isTransparent ? "text-white" : "text-foreground";
  const hoverColor = isTransparent
    ? "hover:text-white/80"
    : "hover:text-secondary";

  const logoClass = isTransparent
    ? "h-10 sm:h-14 w-auto object-contain "
    : "h-10 sm:h-14 w-auto object-contain";

  const defaultLogo = "/assets/Image/nestcraft-logo.svg";
  const whiteLogo = "/assets/Image/nestcraft-logo.svg";

  let currentLogoSrc = normalizeLogoUrl(logoUrl) || defaultLogo;

  if (isTransparent && currentLogoSrc.includes("nestcraft-logo.svg")) {
    currentLogoSrc = whiteLogo;
  }

  return (
    <div
      className={`w-full z-[1200] transition-all duration-300 ${
        isScrolled
          ? "fixed top-0 left-0 animate-in slide-in-from-top-2"
          : isTransparent
            ? "absolute top-0 left-0"
            : "relative"
      } ${isScrolled && isScrollingDown ? "max-sm:-translate-y-full" : "max-sm:translate-y-0"}`}
    >
      {/* ✅ AdminBar — topmost strip above navigation */}
      <AdminBar />
      <header
        className={`w-full flex flex-col relative transition-colors duration-300 ${isTransparent ? "bg-transparent border-transparent" : "bg-background border-b border-border"}`}
      >
        {/* TIER 1: Top Bar */}
        {/* <div className="hidden lg:flex items-center justify-between px-4 sm:px-[5%] xl:px-[8%] py-2 bg-surface/40 border-b border-border text-[12px] text-muted">
          <div className="flex items-center gap-6 font-medium">
            <Link
              href="/furniture"
              className="hover:text-secondary transition-colors text-secondary"
            >
              Furniture
            </Link>
            <Link
              href="/home-interiors"
              className="hover:text-secondary transition-colors"
            >
              Home Interiors
            </Link>
            <Link
              href="/bulk-order"
              className="hover:text-secondary transition-colors"
            >
              Bulk Order
            </Link>
          </div>


          <div className="flex items-center gap-3 sm:gap-4 font-medium">
            <a
              href="tel:+91 9810159604"
              className="flex items-center gap-1.5 hover:text-secondary transition-colors"
            >
              <Phone size={13} /> +91-9810159604
            </a>
            <div className="w-px h-3.5 bg-border/80"></div>
            <Link
              href="/franchise"
              className="flex items-center gap-1.5 hover:text-secondary transition-colors"
            >
              <Building2 size={13} /> Become a Franchise
            </Link>
            <div className="w-px h-3.5 bg-border/80"></div>
            <Link
              href="/track-order"
              className="flex items-center gap-1.5 hover:text-secondary transition-colors"
            >
              <Truck size={13} /> Track Order
            </Link>
            <div className="w-px h-3.5 bg-border/80"></div>
            <Link
              href="/help"
              className="flex items-center gap-1.5 hover:text-secondary transition-colors"
            >
              <HelpCircle size={13} /> Help Center
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-2 py-1 rounded-md
             bg-secondary/10 text-secondary font-medium
             hover:bg-secondary/20 transition-all"
            >
              <User size={14} /> Admin
            </Link>
          </div>
        </div> */}

        <div
          className={`grid grid-cols-3 items-center px-4 sm:px-[5%] xl:px-[5%] py-4 ${isTransparent ? "bg-transparent" : "bg-background"}`}
        >
          {/* Left Column: Menu & Shop */}
          <div className="flex items-center gap-6 justify-start">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`flex items-center gap-2 transition-colors ${textColor} ${hoverColor}`}
            >
              <Menu size={24} strokeWidth={1.5} />
              <span className="text-[15px] font-medium hidden sm:block">
                Menu
              </span>
            </button>
            <Link
              href="/shop"
              className={`hidden sm:flex items-center gap-2 transition-colors ${textColor} ${hoverColor}`}
            >
              <Store size={20} strokeWidth={1.5} />
              <span className="text-[15px] font-normal hidden sm:block">
                Shop
              </span>
            </Link>
          </div>

          {/* Center Column: Logo */}
          <div className="flex justify-center">
            <Link href="/" className="block py-1">
              <img
                src={currentLogoSrc}
                alt={companyName || "NestCraft"}
                className={logoClass}
                onError={(e) => {
                  e.currentTarget.src = defaultLogo;
                }}
              />
            </Link>
          </div>

          {/* Right Column: Icons */}
          <div className="flex items-center gap-6 justify-end">
            {/* Search */}
            <button
              onClick={onSearchOpen}
              className={`flex items-center gap-2 transition-colors ${textColor} ${hoverColor}`}
            >
              <Search size={20} strokeWidth={1.5} />
              <span className="text-[15px] font-normal hidden lg:block">
                Search
              </span>
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                href="/wishlist"
                className={`hidden sm:flex items-center gap-2 transition-colors ${textColor} ${hoverColor}`}
              >
                <div className="relative">
                  <Heart size={20} strokeWidth={1.5} />

                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </div>

                <span className="text-[13px] font-normal hidden lg:block">
                  Wishlist
                </span>
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => setIsCartSidebarOpen(true)}
              className={`flex items-center gap-2 transition-colors cursor-pointer outline-none ${textColor} ${hoverColor}`}
            >
              <div className="relative">
                <ShoppingCart size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[15px] font-normal hidden lg:block">
                Cart
              </span>
            </button>

            {/* Dropdown Button / Login Link */}
            {isAuthenticated ? (
              <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-2 transition-colors cursor-pointer outline-none ${textColor} ${hoverColor}`}
                  >
                    <User size={20} strokeWidth={1.5} />
                    <span className="text-[15px] font-normal hidden lg:block">
                      Account
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-surface border border-border p-2 rounded-[14px] shadow-lg mt-2 z-[1300] outline-none"
                >
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer focus:bg-secondary/10 focus:text-secondary hover:bg-secondary/10 hover:text-secondary transition-all rounded-lg p-2"
                  >
                    <Link
                      // href={user?.role !== "customer" ? "/admin" : "/account"}
                      href="/account"
                      className="flex items-center gap-2.5 px-2 py-1.5 text-sm font-semibold text-foreground/80"
                    >
                      <User
                        size={16}
                        strokeWidth={1.5}
                        className="text-secondary"
                      />
                      Account Info
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer focus:bg-secondary/10 focus:text-secondary hover:bg-secondary/10 hover:text-secondary transition-all rounded-lg p-2"
                  >
                    <Link
                      href="/orders"
                      className="flex items-center gap-2.5 px-2 py-1.5 text-sm font-semibold text-foreground/80"
                    >
                      <Package
                        size={16}
                        strokeWidth={1.5}
                        className="text-secondary"
                      />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/60 my-1 mx-1" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer focus:bg-red-500/10 focus:text-red-600 hover:bg-red-500/10 hover:text-red-600 transition-all rounded-lg p-2 text-red-500 dark:text-red-400 font-semibold flex items-center gap-2.5 px-2 py-1.5 text-sm"
                  >
                    <LogOut size={16} strokeWidth={1.5} />
                    Logout
                  </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
              </div>
            ) : (
              <Link
                href="/login"
                className={`hidden sm:flex items-center gap-2 transition-colors ${textColor} ${hoverColor}`}
              >
                <User size={20} strokeWidth={1.5} />
                <span className="text-[15px] font-normal hidden lg:block">
                  Login
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-0 left-0 w-screen h-[100dvh] z-[50000] bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Primary Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 z-[50002] h-[100dvh] w-[min(85vw,400px)] overflow-y-auto bg-background px-8 py-8 shadow-2xl lg:shadow-none lg:border-r lg:border-border"
            >
              <div className="mb-6 flex items-center justify-between border-b pb-4">
                <img
                  src={normalizeLogoUrl(logoUrl) || defaultLogo}
                  alt={companyName || "NestCraft"}
                  className="h-10 w-auto"
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-muted"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                {displayMenus.map((tab) => {
                  const hasSubMenu = tab.columns && tab.columns.length > 0;
                  const isExpanded = expandedDrawerTab === tab.key;
                  const categorySlug = tab.title
                    ? tab.title.toLowerCase().replace(/\s+/g, "-")
                    : tab.key.toLowerCase().replace(/\s+/g, "-");

                  return (
                    <div
                      key={tab.key}
                      className={`mb-1 rounded-xl transition-all ${isExpanded ? "bg-primary shadow-md" : "border border-transparent hover:bg-secondary/15"}`}
                      onMouseEnter={() => {
                        if (hasSubMenu) setExpandedDrawerTab(tab.key);
                      }}
                    >
                      <div className="flex items-center justify-between group cursor-pointer px-4 py-2.5">
                        {hasSubMenu ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setExpandedDrawerTab(isExpanded ? null : tab.key);
                            }}
                            className={`block text-left text-[15px] font-sans flex-1 ${
                              isExpanded 
                                ? "text-white font-bold" 
                                : tab.isLuxe 
                                  ? "text-black font-medium" 
                                  : "text-foreground font-medium"
                            } ${!isExpanded ? "group-hover:text-[#063A1D]" : ""} transition-colors`}
                          >
                            {tab.title}
                          </button>
                        ) : (
                          <Link
                            href={`/category/${categorySlug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block text-[15px] font-sans flex-1 ${
                              isExpanded 
                                ? "text-white font-bold" 
                                : tab.isLuxe 
                                  ? "text-black font-medium" 
                                  : "text-foreground font-medium"
                            } ${!isExpanded ? "group-hover:text-[#063A1D]" : ""} transition-colors`}
                          >
                            {tab.title}
                          </Link>
                        )}
                        {hasSubMenu && (
                          <button
                            onClick={() =>
                              setExpandedDrawerTab(isExpanded ? null : tab.key)
                            }
                            className={`p-1.5 transition-colors lg:hidden ${isExpanded ? "text-white" : "text-muted hover:text-foreground"}`}
                          >
                            <ChevronRight
                              size={18}
                              className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                            />
                          </button>
                        )}
                        {/* On Desktop, show a right arrow always if it has submenu, matching Swadesh */}
                        {hasSubMenu && (
                          <div className={`hidden lg:flex p-1.5 transition-colors ${isExpanded ? "text-secondary" : "text-muted group-hover:text-[#063A1D]"}`}>
                            <ChevronRight
                              size={18}
                              className="transition-transform duration-200 group-hover:translate-x-1"
                            />
                          </div>
                        )}
                      </div>

                      {/* Mobile Accordion */}
                      <div className="lg:hidden">
                        <AnimatePresence>
                          {hasSubMenu && isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 pb-2 pl-4 space-y-6">
                                {tab.columns?.map(
                                  (col: any, colIdx: number) => (
                                    <div key={colIdx} className="space-y-4">
                                      {col.sections?.map(
                                        (section: any, secIdx: number) => (
                                          <div key={secIdx}>
                                            <h4 className="text-[16px] font-sans font-medium text-white/90 mb-3">
                                              {section.heading}
                                            </h4>
                                            <ul className="space-y-2.5">
                                              {section.links?.map(
                                                (
                                                  link: any,
                                                  linkIdx: number,
                                                ) => {
                                                  const href =
                                                    link.href === "#"
                                                      ? `/category/${link.title.toLowerCase().replace(/\s+/g, "-")}`
                                                      : link.href;
                                                  return (
                                                    <li key={linkIdx}>
                                                      <Link
                                                        href={href}
                                                        onClick={() =>
                                                          setIsMobileMenuOpen(
                                                            false,
                                                          )
                                                        }
                                                        className="text-[15px] font-medium text-white/70 hover:text-white hover:translate-x-1.5 hover:font-semibold transition-all inline-block py-1.5"
                                                      >
                                                        {link.title}
                                                      </Link>
                                                    </li>
                                                  );
                                                },
                                              )}
                                            </ul>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  ),
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Desktop Secondary Flyout Drawer */}
            <div className="hidden lg:block">
              <AnimatePresence>
                {expandedDrawerTab && (
                  <motion.div
                    key={expandedDrawerTab}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: "tween", duration: 0.2 }}
                    className="fixed left-[400px] top-0 z-[50001] bg-white h-full w-[450px] overflow-y-auto bg-surface px-10 py-10 shadow-[20px_0_40px_-15px_rgba(0,0,0,0.05)] border-l border-border"
                  >
                    {(() => {
                      const activeTab = displayMenus.find(
                        (t) => t.key === expandedDrawerTab,
                      );
                      if (!activeTab || !activeTab.columns) return null;

                      const activeCategorySlug = activeTab.title
                        ? activeTab.title.toLowerCase().replace(/\s+/g, "-")
                        : activeTab.key.toLowerCase().replace(/\s+/g, "-");

                      return (
                        <div className="space-y-8">
                          <Link
                            href={`/category/${activeCategorySlug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-center w-full py-3 rounded-full bg-primary text-white text-[12px] font-black uppercase tracking-[2px] hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                          >
                            Explore all {activeTab.title}
                          </Link>

                          {activeTab.columns.map((col: any, colIdx: number) => (
                            <div key={colIdx} className="space-y-8">
                              {col.sections?.map(
                                (section: any, secIdx: number) => (
                                  <div key={secIdx}>
                                    <h4 className="text-[10px] font-black uppercase tracking-[3px] text-secondary mb-4 flex items-center gap-2">
                                      {section.heading}
                                      <div className="h-px bg-secondary/30 flex-1"></div>
                                    </h4>
                                    <ul className="space-y-1">
                                      {section.links?.map(
                                        (link: any, linkIdx: number) => {
                                          // Optional: Format submenu links too, just in case backend has them as just text names without paths,
                                          // but assuming backend provides proper `link.href` for sub-links if needed, we'll keep `link.href` or fix it if it's '#'
                                          const href =
                                            link.href === "#"
                                              ? `/category/${link.title.toLowerCase().replace(/\s+/g, "-")}`
                                              : link.href;
                                          return (
                                            <li key={linkIdx}>
                                              <Link
                                                href={href}
                                                onClick={() =>
                                                  setIsMobileMenuOpen(false)
                                                }
                                                className="group flex items-center gap-2 text-[15px] font-medium text-foreground/80 hover:text-[#063A1D] transition-all py-1.5"
                                              >
                                                <span className="w-1.5 h-1.5 rounded-full bg-secondary/0 group-hover:bg-secondary transition-colors"></span>
                                                <span className="group-hover:translate-x-1 transition-transform">{link.title}</span>
                                              </Link>
                                            </li>
                                          );
                                        },
                                      )}
                                    </ul>
                                  </div>
                                ),
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Search Overlay & Footer & SiteChrome (unchanged mostly) ---
const SearchOverlay = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const { allProducts, hasFetched } = useAppSelector((state) => state.adminProducts);

  useEffect(() => {
    if (isOpen && !hasFetched) {
      dispatch(fetchProducts());
    }
  }, [isOpen, hasFetched, dispatch]);

  const filteredProducts =
    query.length > 1
      ? allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.type.toLowerCase().includes(query.toLowerCase()),
        )
      : [];

  const handleSelect = (product: any) => {
    const identifier = product.slug || product._id || product.id;
    router.push(`/product/${identifier}`);
    onClose();
    setQuery("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[50002] flex flex-col items-center bg-background/95 px-4 pt-24 backdrop-blur-xl sm:px-[5%] sm:pt-32"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-border transition-all hover:bg-surface sm:right-10 sm:top-10"
          >
            <X size={22} />
          </button>
          <div className="w-full max-w-3xl">
            <div className="relative mb-10 sm:mb-12">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted sm:left-6"
                size={22}
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for furniture..."
                className="h-16 w-full rounded-[24px] border border-border bg-surface pl-12 pr-4 text-lg font-bold outline-none transition-all placeholder:text-black/70 focus:border-secondary sm:h-20 sm:pl-16 sm:pr-8 sm:text-2xl"
              />
            </div>

            {/* Display Dynamic Search Results */}
            {query.length > 1 && (
              <div className="max-h-[60vh] overflow-y-auto rounded-2xl bg-surface p-4 shadow-xl border border-border">
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {filteredProducts.map((product) => {
                      const image = product.gallery?.[0]?.url || resolveProductImage(product);
                      const price = product.pricing?.price || product.price || "0";

                      return (
                        <button
                          key={product._id || product.id}
                          onClick={() => handleSelect(product)}
                          className="flex items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-secondary/10"
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                            <img
                              src={image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground line-clamp-1">{product.name}</h4>
                            <p className="text-sm text-muted">{product.type}</p>
                            <p className="mt-1 font-medium text-secondary">₹{price}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted">
                    No products found matching "{query}"
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Footer = ({
  logoUrl,
  companyName,
  brandConfig,
}: {
  logoUrl?: string;
  companyName?: string;
  brandConfig?: any;
}) => (
  <footer
    data-annotate-id="site-footer"
    className="border-t border-border bg-surface px-[5%] pb-10 pt-20"
  >
    <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-6">
        <Link href="/" className="block">
          <img
            src={normalizeLogoUrl(logoUrl)}
            alt={companyName || "NestCraft"}
            className="h-18 w-auto"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_LOGO;
            }}
          />
        </Link>

        <p className="max-w-[300px] font-semibold text-muted">
          Sculpting personal spaces with design-led essentials. Minimalist
          furniture crafted for the modern home.
        </p>

        <div className="flex gap-4">
          {[
            {
              name: "Instagram",
              icon: Instagram,
              url: "https://www.instagram.com/nestcraft_furniture/",
            },
            {
              name: "Facebook",
              icon: Facebook,
              url: "https://www.facebook.com/profile.php?id=61581337593979",
            },
            {
              name: "Twitter",
              icon: Twitter,
              url: "https://x.com/NestCFurniture",
            },
            { name: "Youtube", icon: Youtube, url: "#" },
          ].map((social) => (
            <a
              key={social.name}
              href={social.url}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-all hover:border-secondary hover:text-secondary"
            >
              <span className="sr-only">{social.name}</span>
              <social.icon size={18} />
            </a>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-6 text-[11px] font-black uppercase tracking-[2px] text-foreground">
          Shop
        </h4>
        <ul className="space-y-4">
          {[
            "Living Room",
            "Bedroom",
            "Dining Room",
            "Home Office",
            "Decor",
          ].map((item) => (
            <li key={item}>
              <Link
                href="/shop"
                className="font-bold text-muted transition-colors hover:text-secondary"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="mb-6 text-[11px] font-black uppercase tracking-[2px] text-foreground">
          Company
        </h4>
        <ul className="space-y-4">
          {[
            { name: "Our Story", path: "/about" },
            { name: "Craftsmanship", path: "/about" },
            { name: "Sustainability", path: "/about" },
            { name: "Contact", path: "/contact" },
          ].map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className="font-bold text-muted transition-colors hover:text-secondary"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="mb-6 text-[11px] font-black uppercase tracking-[2px] text-foreground">
          Support
        </h4>
        <ul className="space-y-4">
          {[
            { name: "Shipping & Delivery", path: "/faq" },
            { name: "Returns & Exchanges", path: "/faq" },
            { name: "Care Guide", path: "/faq" },
            { name: "FAQ", path: "/faq" },
            { name: "Privacy Policy", path: "/faq" },
          ].map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className="font-bold text-muted transition-colors hover:text-secondary"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="huge-watermark">NESTCRAFT</div>

    <div className="md:flex text-center flex-col items-center justify-between gap-6 border-t border-border mt-10 pt-2 md:flex-row">
      <p className="py-2 text-[14px] font-medium transition-colors text-[#0b1610]">
        © {new Date().getFullYear()} {companyName || "NestCraft Interiors"}. All
        rights reserved.
      </p>
      <div className="flex items-center justify-center gap-8">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group relative text-center inline-flex items-center  text-[14px] font-medium transition-colors text-[#0b1610] hover:text-secondary"
        >
          Back to Top <ArrowUp size={14} className="ml-1" />
        </button>
        <div className="hidden gap-8 md:flex">
          <a
            href="#"
            className="text-[14px] font-medium transition-colors text-[#0b1610] hover:text-[#98c45f]"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-[14px] font-medium transition-colors text-[#0b1610] hover:text-[#98c45f]"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-[14px] font-medium transition-colors text-[#0b1610] hover:text-[#98c45f]"
          >
            Cookies
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default function SiteChrome({
  children,
  brandConfig,
}: {
  children: React.ReactNode;
  brandConfig: any;
}) {
  const [theme, setTheme] = useState("light");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  // Handle Scroll for Sticky logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 120) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Determine scroll direction for smart mobile header
      if (currentScrollY > 60) {
        if (currentScrollY > lastScrollY.current + 10) {
          setIsScrollingDown(true);
        } else if (currentScrollY < lastScrollY.current - 10) {
          setIsScrollingDown(false);
        }
      } else {
        setIsScrollingDown(false);
      }

      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const initialTheme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsSearchOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const primaryLogo = normalizeLogoUrl(
    brandConfig?.logos?.find((l: any) => l.id === "primary")?.url ||
      brandConfig?.logos?.[0]?.url,
  );

  const companyName = brandConfig?.companyInfo?.name || "NestCraft";

  const cartCount = useAppSelector(selectCartCount);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const wishlistCount = (user && user?.wishlist && user.wishlist.length) || 0;

  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16 sm:pb-0">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onSearchOpen={() => setIsSearchOpen(true)}
        logoUrl={primaryLogo}
        companyName={companyName}
        setIsCartSidebarOpen={setIsCartSidebarOpen}
        isScrolled={isScrolled}
        isScrollingDown={isScrollingDown}
      />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <main className="flex-1 w-full">{children}</main>
      <Footer
        logoUrl={primaryLogo}
        companyName={companyName}
        brandConfig={brandConfig}
      />

      {/* Mobile Bottom Navigation Bar */}
      <div
        className={`sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border z-[1300] flex justify-around items-center px-2 transition-transform duration-300 ${
          isScrolled && !isScrollingDown ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <Link href="/" className="flex flex-col items-center justify-center gap-1 w-16 text-muted hover:text-foreground">
          <Home size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        <Link href={isAuthenticated ? "/account" : "/login"} className="flex flex-col items-center justify-center gap-1 w-16 text-muted hover:text-foreground">
          <User size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-bold">Account</span>
        </Link>

        <Link href="/shop" className="flex flex-col items-center justify-center gap-1 w-16 text-muted hover:text-foreground">
          <Store size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-bold">Shop</span>
        </Link>

        <Link href="/wishlist" className="relative flex flex-col items-center justify-center gap-1 w-16 text-muted hover:text-foreground">
          <div className="relative">
            <Heart size={20} strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#E5484D] text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Wishlist</span>
        </Link>

        <Link href="/cart" className="relative flex flex-col items-center justify-center gap-1 w-16 text-muted hover:text-foreground">
          <div className="relative">
            <ShoppingCart size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#E5484D] text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Cart</span>
        </Link>
      </div>

      <CartSidebar isOpen={isCartSidebarOpen} onClose={() => setIsCartSidebarOpen(false)} />
    </div>
  );
}
