import { createAsyncThunk } from "@reduxjs/toolkit";
import { CategoryRecord } from "./categoriesSlices";

const tenantHeader = process.env.NEXT_PUBLIC_TENANT_ID;

interface ApiError {
  message: string;
  status?: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const fetchCategories = createAsyncThunk<
  CategoryRecord[],
  { type?: string; includeCounts?: string } | void,
  { rejectValue: ApiError }
>("categories/fetchCategories", async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.type) queryParams.set("type", params.type);
      if (params.includeCounts)
        queryParams.set("includeCounts", params.includeCounts);
    }
    const res = await fetch(
      `/api/commerce/categories?${queryParams.toString()}`,
      {
        headers: {
          "x-tenant-db": tenantHeader || "",
        },
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
    return data.categories;
  } catch (error: any) {
    return rejectWithValue({
      message: error?.message || "Something went wrong",
    });
  }
});

export const createCategory = createAsyncThunk<
  CategoryRecord,
  any,
  { rejectValue: ApiError }
>("categories/createCategory", async (payload, { rejectWithValue }) => {
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
    return rejectWithValue({
      message: error?.message || "Something went wrong",
    });
  }
});

export const updateCategory = createAsyncThunk<
  CategoryRecord,
  { id: string; payload: any },
  { rejectValue: ApiError }
>("categories/updateCategory", async ({ id, payload }, { rejectWithValue }) => {
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
    return rejectWithValue({
      message: error?.message || "Something went wrong",
    });
  }
});

export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiError }
>("categories/deleteCategory", async (id, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/commerce/categories/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-db": tenantHeader || "",
      },
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      return rejectWithValue({
        message: data?.error || "Failed to delete category",
        status: res.status,
      });
    }
    return id;
  } catch (error: any) {
    return rejectWithValue({
      message: error?.message || "Something went wrong",
    });
  }
});

export const bulkImportCategories = createAsyncThunk<
  ApiResponse<any>,
  any[],
  { rejectValue: ApiError }
>("categories/bulkImport", async (categories, { rejectWithValue }) => {
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
    return rejectWithValue({
      message: error?.message || "Something went wrong",
    });
  }
});
