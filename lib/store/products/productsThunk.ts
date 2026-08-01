import { createAsyncThunk } from "@reduxjs/toolkit";
import { normalizeCommerceProduct } from "@/lib/commerce/product-normalization";

const tenantHeader = process.env.NEXT_PUBLIC_TENANT_ID;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/commerce/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": "kp_nestcraft",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch products");
      return {
        ...data,
        data: Array.isArray(data.data)
          ? data.data.map(normalizeCommerceProduct)
          : [],
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// export const fetchProductsByCategory = createAsyncThunk(
//   "products/fetchByCategory",
//   async (
//     {
//       category,
//       filters,
//     }: {
//       category: string;
//       filters: any;
//     },
//     { rejectWithValue },
//   ) => {
//     try {
//       const parmas = new URLSearchParams(filters);
//       const response = await fetch(
//         `/api/commerce/products?category=${category}&${parmas.toString()}`,
//         {
//           headers: {
//             "x-tenant-db": tenantHeader || "",
//             "Content-Type": "application/json",
//           },
//           credentials: "include",
//         },
//       );
//       const data = await response.json();
//       if (!response.ok)
//         throw new Error(data.message || "Failed to fetch products");
//       return data;
//     } catch (error: any) {
//       return rejectWithValue(error.message);
//     }
//   },
// );

// ─── productsThunk.ts — updated fetchProductsByCategory ───────────────
// Replace your existing fetchProductsByCategory with this version.
// New args: offset, limit, append. The `append` flag is read by the slice
// via action.meta.arg to decide replace vs append.

export const BATCH_SIZE = 50;

export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchByCategory",
  async (
    {
      category,
      filters,
      offset = 0,
      limit = BATCH_SIZE,
      append = false, // eslint-disable-line @typescript-eslint/no-unused-vars
    }: {
      category: string;
      filters: Record<string, string>;
      offset?: number;
      limit?: number;
      append?: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      // Strip pagination params — the API should NOT paginate per UI page,
      // it should return a batch based on offset/limit.
      const { page, perPage, ...realFilters } = filters;

      const params = new URLSearchParams(realFilters);
      params.set("page", String(offset / limit + 1));
      params.set("perPage", String(limit));

      const response = await fetch(
        `/api/commerce/products?category=${category}&${params.toString()}`,
        {
          headers: {
            "x-tenant-db": tenantHeader || "",
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch products");
      return {
        ...data,
        data: Array.isArray(data.data)
          ? data.data.map(normalizeCommerceProduct)
          : [],
      }; // expected: { data: [...], totalProducts, filters }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/commerce/products/${id}`, {
        headers: {
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch product");
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const saveProduct = createAsyncThunk(
  "products/save",
  async (
    { id, payload }: { id?: string; payload: any },
    { rejectWithValue },
  ) => {
    try {
      const endpoint = id
        ? `/api/commerce/products/${id}`
        : `/api/commerce/products`;
      const method = id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to save product");
      }

      return { data: data.data, editingId: id };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/commerce/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete product");
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const bulkImportProducts = createAsyncThunk(
  "products/bulkImport",
  async (products: any[], { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/commerce/products/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
        body: JSON.stringify(products),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to import products");
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);
