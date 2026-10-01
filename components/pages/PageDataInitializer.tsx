"use client";

import { useEffect, useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setCurrentPages, setEditMode } from "@/lib/store/pages/pagesSlice";
import { fetchPageBySlugThunk } from "@/lib/store/pages/pageThunk";
import type { Page } from "@/lib/store/pages/pageType";

export default function PageDataInitializer({
  initialData,
  slug,
}: {
  initialData: Page | null;
  slug?: string;
}) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const isEditable = useAppSelector((state) => state.pages.isEditable);
  const pageSlug = slug || initialData?.slug || "home";

  // Read edit mode from URL
  const editModeFromUrl = searchParams.get('edit') === 'true';

  // useLayoutEffect runs synchronously before paint on the client,
  // so the store is seeded before any child component reads from it.
  // Falls back to useEffect on SSR (no-op — server doesn't dispatch).
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  // 1. Seed Redux from SSR cache for immediate first render
  useIsomorphicLayoutEffect(() => {
    if (initialData) {
      dispatch(setCurrentPages(initialData));
    }
  }, [dispatch, initialData]);

  // 2. Sync edit mode from URL to Redux
  useEffect(() => {
    if (editModeFromUrl !== isEditable) {
      dispatch(setEditMode(editModeFromUrl));
    }
  }, [dispatch, editModeFromUrl, isEditable]);

  // 3. If edit mode is active, fetch fresh data directly from API (bypasses server cache)
  useEffect(() => {
    if (editModeFromUrl && pageSlug) {
      dispatch(fetchPageBySlugThunk(pageSlug));
    }
  }, [dispatch, editModeFromUrl, pageSlug]);

  return null;
}
