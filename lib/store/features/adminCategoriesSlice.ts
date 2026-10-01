import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const tenantHeader = process.env.NEXT_PUBLIC_TENANT_ID;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CategoryType = "product" | "portfolio" | "blog";

export type CategoryRecord = {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  slug: string;
  type: CategoryType;
  parentId?: string | null;
  description?: string;
  entityCount?: number;
  pageStatus?: string;
  bannerImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  templateKey?: string;
  productTemplateKey?: string;
  banner?: {
    altText?: string;
    caption?: string;
    url?: string;
  };
};

interface ApiError {
  message: string;
  status?: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface AdminCategoriesState {
  allCategories: CategoryRecord[];
  categoriesLength: number;
  categoryLoading: boolean;
  categoryError: string | null;
  hasCategoriesFetched: boolean;
}

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

const initialState: AdminCategoriesState = {
  allCategories: [],
  categoriesLength: 0,
  categoryLoading: false,
  categoryError: null,
  hasCategoriesFetched: false,
};

// ---------------------------------------------------------------------------
// Thunks — all CRUD operations through the Next.js proxy (/api/commerce/...)
// ---------------------------------------------------------------------------

/** Fetch all categories. Pass optional { type, includeCounts } to filter. */
export const fetchCategories = createAsyncThunk<
  { categories: CategoryRecord[]; categoriesLength: number },
  { type?: string; includeCounts?: string } | void,
  { rejectValue: ApiError }
>("adminCategories/fetchCategories", async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.type) queryParams.set("type", params.type);
      if (params.includeCounts)
        queryParams.set("includeCounts", params.includeCounts);
    }
    const qs = queryParams.toString();
    const res = await fetch(
      `/api/commerce/categories${qs ? `?${qs}` : ""}`,
      {
        headers: { "x-tenant-db": tenantHeader || "" },
        credentials: "include",
      },
    );
    const data = await res.json();
    if (!res.ok) {
      return rejectWithValue({
        message: data?.error || "Failed to fetch categories",
        status: res.status,
      });
    }
    const categories = Array.isArray(data)
      ? data
      : data.categories || data.data?.categories || [];
    return { categories, categoriesLength: data.categories_length ?? categories.length };
  } catch (error: any) {
    return rejectWithValue({ message: error?.message || "Something went wrong" });
  }
});

export const createCategory = createAsyncThunk<
  CategoryRecord,
  any,
  { rejectValue: ApiError }
>("adminCategories/createCategory", async (payload, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/commerce/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-db": tenantHeader || "",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return rejectWithValue({
        message: data?.error || "Failed to create category",
        status: res.status,
      });
    }
    return data;
  } catch (error: any) {
    return rejectWithValue({ message: error?.message || "Something went wrong" });
  }
});

export const updateCategory = createAsyncThunk<
  CategoryRecord,
  { id: string; payload: any },
  { rejectValue: ApiError }
>(
  "adminCategories/updateCategory",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/commerce/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue({
          message: data?.error || "Failed to update category",
          status: res.status,
        });
      }
      return data;
    } catch (error: any) {
      return rejectWithValue({ message: error?.message || "Something went wrong" });
    }
  },
);

export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiError }
>("adminCategories/deleteCategory", async (id, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/commerce/categories/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-db": tenantHeader || "",
      },
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return rejectWithValue({
        message: data?.error || "Failed to delete category",
        status: res.status,
      });
    }
    return id;
  } catch (error: any) {
    return rejectWithValue({ message: error?.message || "Something went wrong" });
  }
});

export const bulkImportCategories = createAsyncThunk<
  ApiResponse<any>,
  any[],
  { rejectValue: ApiError }
>("adminCategories/bulkImport", async (categories, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/commerce/categories/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-db": tenantHeader || "",
      },
      credentials: "include",
      body: JSON.stringify(categories),
    });
    const data = await res.json();
    if (!res.ok) {
      return rejectWithValue({
        message: data?.error || "Failed to import categories",
        status: res.status,
      });
    }
    return data;
  } catch (error: any) {
    return rejectWithValue({ message: error?.message || "Something went wrong" });
  }
});

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const adminCategoriesSlice = createSlice({
  name: "adminCategories",
  initialState,
  reducers: {
    setAllCategories: (state, action: PayloadAction<CategoryRecord[]>) => {
      state.allCategories = action.payload;
    },
    resetCategoriesFetch: (state) => {
      state.hasCategoriesFetched = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCategories.pending, (state) => {
        state.categoryLoading = true;
        state.categoryError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.allCategories = action.payload.categories;
        state.categoriesLength = action.payload.categoriesLength;
        state.hasCategoriesFetched = true;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoryLoading = false;
        state.categoryError = action.payload?.message || "Failed to fetch categories";
        state.hasCategoriesFetched = true;
      })
      // Create
      .addCase(createCategory.pending, (state) => {
        state.categoryLoading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.allCategories = [action.payload, ...state.allCategories];
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.categoryLoading = false;
        state.categoryError = action.payload?.message || "Failed to create category";
      })
      // Update
      .addCase(updateCategory.pending, (state) => {
        state.categoryLoading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.categoryLoading = false;
        const updated = action.payload;
        const matchId = updated._id || updated.id;
        state.allCategories = state.allCategories.map((cat) =>
          (cat._id || cat.id) === matchId ? updated : cat,
        );
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.categoryLoading = false;
        state.categoryError = action.payload?.message || "Failed to update category";
      })
      // Delete
      .addCase(deleteCategory.pending, (state) => {
        state.categoryLoading = true;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categoryLoading = false;
        const removedId = action.payload;
        state.allCategories = state.allCategories.filter(
          (cat) => (cat._id || cat.id) !== removedId,
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.categoryLoading = false;
        state.categoryError = action.payload?.message || "Failed to delete category";
      });
  },
});

export const { setAllCategories, resetCategoriesFetch } = adminCategoriesSlice.actions;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectAllCategories = (state: { adminCategories: AdminCategoriesState }) =>
  state.adminCategories.allCategories;

export const selectCategoryLoading = (state: { adminCategories: AdminCategoriesState }) =>
  state.adminCategories.categoryLoading;

export const selectCategoryError = (state: { adminCategories: AdminCategoriesState }) =>
  state.adminCategories.categoryError;

export const selectHasCategoriesFetched = (state: { adminCategories: AdminCategoriesState }) =>
  state.adminCategories.hasCategoriesFetched;

export const selectCategoriesLength = (state: { adminCategories: AdminCategoriesState }) =>
  state.adminCategories.categoriesLength;

/** Convenience: only product-type, active categories */
export const selectProductCategories = (state: { adminCategories: AdminCategoriesState }) =>
  state.adminCategories.allCategories.filter(
    (c) =>
      !["blog", "portfolio"].includes(String(c.type || "").toLowerCase()) &&
      !["archived", "inactive"].includes(String(c.pageStatus || "").toLowerCase()),
  );

// Legacy selectors — kept for backward compat
export const selectAdminCategories = selectAllCategories;
export const selectAdminCategoriesLoading = selectCategoryLoading;
export const selectAdminCategoriesError = selectCategoryError;

export default adminCategoriesSlice.reducer;
