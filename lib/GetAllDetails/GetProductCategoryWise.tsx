// "use client";

// import { useEffect, useMemo } from "react";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "../store/store";
// import { fetchProductsByCategory } from "../store/products/productsThunk";
// import { useParams, useSearchParams } from "next/navigation";

// export default function GetAllProducts() {
//   const { id } = useParams<{ id: string }>();
//   const searchParams = useSearchParams();
//   const filters = useMemo(
//     () => Object.fromEntries(searchParams.entries()),
//     [searchParams],
//   );

//   const dispatch = useDispatch<AppDispatch>();

//   useEffect(() => {
//     if (id !== undefined) {
//       dispatch(fetchProductsByCategory({ category: id, filters }));
//     } else {
//       dispatch(fetchProductsByCategory({ category: "all", filters }));
//     }
//   }, [id, filters]);

//   return null;
// }


"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import {
  fetchProductsByCategory,
  BATCH_SIZE,
} from "../store/products/productsThunk";
import { useParams, useSearchParams } from "next/navigation";

export default function GetAllProducts() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const { allProducts, totalProducts, loading, loadingMore } = useSelector(
    (state: RootState) => state.adminProducts,
  );

  const category = id ?? "all";
  const page = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("perPage")) || 9;

  // ── A stable key of the filters that actually change the RESULT SET.
  //    page/perPage are excluded on purpose: changing pages must NOT refetch.
  const filterKey = useMemo(() => {
    const entries = Array.from(searchParams.entries())
      .filter(([k]) => k !== "page" && k !== "perPage")
      .sort(([a], [b]) => a.localeCompare(b));
    return JSON.stringify(entries);
  }, [searchParams]);

  const filters = useMemo(
    () => Object.fromEntries(JSON.parse(filterKey)) as Record<string, string>,
    [filterKey],
  );

  // ── 1. Category or filters changed → fresh fetch of the FIRST batch (50)
  useEffect(() => {
    dispatch(
      fetchProductsByCategory({
        category,
        filters,
        offset: 0,
        limit: BATCH_SIZE,
        append: false,
      }),
    );
  }, [dispatch, category, filterKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. User paginated past the cached products → fetch the next batch.
  //    This effect re-runs after each append, so jumping to a far page
  //    keeps fetching batches until the page is covered.
  useEffect(() => {
    const needed = page * perPage; // last index the current page requires
    const cached = allProducts.length;
    const moreExists = cached < totalProducts;

    if (needed > cached && moreExists && !loading && !loadingMore) {
      dispatch(
        fetchProductsByCategory({
          category,
          filters,
          offset: cached, // continue where the cache ends
          limit: BATCH_SIZE,
          append: true, // <-- slice appends instead of replacing
        }),
      );
    }
  }, [
    dispatch,
    category,
    filterKey, // eslint-disable-line react-hooks/exhaustive-deps
    page,
    perPage,
    allProducts.length,
    totalProducts,
    loading,
    loadingMore,
  ]);

  return null;
}