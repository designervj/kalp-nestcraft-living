"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { fetchCategories } from "../store/features/adminCategoriesSlice";

/**
 * Invisible data-fetching component.
 * Mount this once (e.g. in a layout) to populate state.adminCategories.
 * It is guarded by `hasCategoriesFetched` so the API is called exactly once
 * per session, regardless of how many times this component mounts.
 */
export default function GetAllCategories({
  type,
}: {
  /** Optional: pass a category type to pre-filter (e.g. "product") */
  type?: string;
}) {
  const { hasCategoriesFetched, categoryLoading } = useSelector(
    (state: RootState) => state.adminCategories,
  );

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Guard: skip if already fetched or currently loading
    if (hasCategoriesFetched || categoryLoading) return;

    dispatch(fetchCategories(type ? { type } : undefined));
  }, [user, hasCategoriesFetched, categoryLoading, type, dispatch]);

  return null;
}
