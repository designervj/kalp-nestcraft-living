"use client";

import React, { useEffect, useState } from "react";
import {
  Heart,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ChevronRight,
  Search,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store/store";
import { motion, AnimatePresence } from "motion/react";
import { ProductFormState } from "@/lib/store/products/productsSlices";
import { toast } from "sonner";
import { updateProfileThunk } from "@/lib/store/auth/authThunks";
import Link from "next/link";

export default function WishlistPageClient() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const [wishlistProducts, setWishlistProducts] = useState<ProductFormState[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.wishlist?.length) {
      setWishlistProducts([]);
      return;
    }

    (async () => {
      setIsLoading(true);
      try {
        const responses = await Promise.all(
          user.wishlist!.map((id) =>
            fetch(`/api/commerce/products/${id}`, {
              headers: {
                "Content-Type": "application/json",
                "x-tenant-db": process.env.NEXT_PUBLIC_TENANT_ID!,
              },
            }),
          ),
        );

        const products = await Promise.all(
          responses.map((res) => res.json()),
        );
        const validProducts = products.filter((p) => p && p.id);
        setWishlistProducts(validProducts);
      } catch (error) {
        console.error("Failed to fetch wishlist products:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user?.wishlist]);

  const handleRemove = async (product: ProductFormState) => {
    if (!user?.id || !user?.wishlist || !product.id) return;

    const updatedWishlist = user.wishlist.filter((id) => id !== product.id);
    try {
      setWishlistProducts((prev) =>
        prev.filter((p) => p.id !== product.id),
      );

      const res = await dispatch(
        updateProfileThunk({
          userData: {
            wishlist: updatedWishlist,
          },
        }),
      ).unwrap();
      if (res.success) {
        toast.success("Product removed from wishlist");
      }
    } catch (error) {
      toast.error("Failed to remove product from wishlist");
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
          <Heart size={32} className="text-secondary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Please log in
        </h1>
        <p className="text-muted font-semibold max-w-sm mb-8">
          Log in to view and manage the products you've saved to your wishlist.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center bg-primary text-white px-10 h-14 rounded-full text-[14px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-all"
        >
          Login to Account
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto px-[5%] pb-20 pt-[50px]">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-secondary mx-auto" />
            <p className="text-muted font-bold text-sm">
              Loading wishlist...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-12 px-[5%] max-w-7xl mx-auto">
      {/* BREADCRUMBS */}
      <div className="crumbs flex items-center gap-2 mb-8 text-sm font-bold text-muted">
        <Link href="/" className="hover:text-secondary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="opacity-50" />
        <strong className="text-foreground">Wishlist</strong>
      </div>

      {/* PAGE TITLE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-[42px] md:text-[52px] font-bold tracking-tight leading-none">
            Your Wishlist
          </h1>
          <p className="text-muted font-semibold mt-3 max-w-md">
            Pieces you've saved for later. They'll be right here whenever you're
            ready.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-surface border border-border px-5 py-2.5 rounded-full flex items-center gap-2">
            <span className="text-secondary font-black">
              {wishlistProducts.length}
            </span>
            <span className="text-muted text-[11px] font-black uppercase tracking-wider">
              {wishlistProducts.length === 1 ? "Item Saved" : "Items Saved"}
            </span>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-2 text-[12px] font-black text-secondary hover:text-primary transition-colors uppercase tracking-wider"
          >
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
        </div>
      </div>

      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {wishlistProducts.map((product) => (
              <motion.article
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  transition: { duration: 0.2 },
                }}
                className="group bg-surface border border-border rounded-2xl overflow-hidden hover:border-secondary/40 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-[4/5] bg-background relative overflow-hidden">
                  <Link
                    href={`/product/${product.slug}`}
                    className="block w-full h-full"
                  >
                    <img
                      src={
                        product.gallery?.[0]?.url || "/assets/Image/Sofa.jpg"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>

                  {/* REMOVE ACTION */}
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={() => handleRemove(product)}
                      className="w-9 h-9 bg-white/90 backdrop-blur-xs text-foreground border border-border rounded-full flex items-center justify-center shadow-md hover:bg-white hover:text-red-500 hover:border-red-300 hover:scale-110 transition-all duration-300"
                      title="Remove from Wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-black text-muted uppercase tracking-[2px]">
                      {product.sku || "Nest Craft"}
                    </div>
                    <h3 className="font-heading text-[18px] font-black leading-tight text-foreground/92 group-hover:text-secondary transition-colors line-clamp-2">
                      <Link href={`/product/${product.slug}`}>
                        {product.name}
                      </Link>
                    </h3>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/product/${product.slug}`}
                      className="w-full bg-primary text-white text-[11px] font-bold tracking-wider uppercase px-5 h-11 rounded-full hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group/link"
                    >
                      View Details
                      <ArrowRight
                        size={14}
                        className="group-hover/link:translate-x-1 transition-transform"
                      />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* EMPTY STATE */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-28 flex flex-col items-center text-center max-w-lg mx-auto"
        >
          <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-8 relative">
            <ShoppingBag size={40} className="text-secondary/30" />
            <Heart
              size={20}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary animate-pulse"
            />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Your wishlist is empty
          </h2>
          <p className="text-muted font-semibold mb-10 leading-relaxed">
            You haven't saved anything yet. Browse the shop and tap the heart on
            pieces you love — they'll be waiting for you here.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 bg-primary text-white text-[13px] font-bold tracking-wider uppercase px-12 h-14 rounded-full hover:bg-primary/90 transition-all"
          >
            <Search size={17} /> Browse Products
          </Link>
        </motion.div>
      )}
    </div>
  );
}
