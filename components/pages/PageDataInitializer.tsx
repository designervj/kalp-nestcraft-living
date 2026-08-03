"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { setCurrentPages } from "@/lib/store/pages/pagesSlice";
import type { Page } from "@/lib/store/pages/pageType";

export default function PageDataInitializer({ initialData }: { initialData: Page | null }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (initialData) dispatch(setCurrentPages(initialData));
  }, [dispatch, initialData]);

  return null;
}
