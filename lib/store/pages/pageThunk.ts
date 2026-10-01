import { createAsyncThunk } from "@reduxjs/toolkit";
import { Page } from "./pageType";

// Fetch all pages
export const fetchPagesThunk = createAsyncThunk(
  "pages/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cms/pages`, { credentials: "include" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch pages");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : (data?.data || data?.pages || []);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchFastApiPagesThunk = createAsyncThunk(
  "pages/fetchFastApiAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/pages", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch pages");
      }
      const data = await response.json();
      console.log("all pages fetched ", data);
      return Array.isArray(data) ? data : data.pages;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Fetch a single page by slug
export const fetchPageBySlugThunk = createAsyncThunk(
  "pages/fetchBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      const cacheBuster = `_t=${Date.now()}`;
      const response = await fetch(`/api/cms/pages?slug=${encodeURIComponent(slug)}&${cacheBuster}`, {
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          accept: "*/*",
        },
      });
      if (!response.ok) {
        const fallback = await fetch(`/api/pages?slug=${encodeURIComponent(slug)}&${cacheBuster}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (fallback.ok) return await fallback.json();
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch page");
      }
      const result = await response.json();
      return result?.data || result;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Create a new page
export const createPageThunk = createAsyncThunk(
  "pages/create",
  async (pageData: Page, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/pages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(pageData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create page");
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Update an existing page
export const updatePageThunk = createAsyncThunk(
  "pages/update",
  async (
    { id, pageData }: { id: string; pageData: Partial<Page> },
    { rejectWithValue },
  ) => {
    try {
      const { _id, id: pageId, createdAt, updatedAt, studioRevision, updatedBy, ...cleanData } = pageData as any;
      const response = await fetch(`/api/cms/pages/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        credentials: "include",
        body: JSON.stringify(cleanData),
      });
      if (!response.ok) {
        const fallback = await fetch(`/api/pages/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(pageData),
        });
        if (fallback.ok) return await fallback.json();
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update page");
      }
      const result = await response.json();
      const updated = result?.data || result;
      return updated?._id || updated?.id ? updated : ({ _id: id, ...pageData } as Page);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Delete a page
export const deletePageThunk = createAsyncThunk(
  "pages/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete page");
      }
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);
