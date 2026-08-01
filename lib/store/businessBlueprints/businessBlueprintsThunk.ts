import { createAsyncThunk } from "@reduxjs/toolkit";
import { BusinessBlueprint } from "./businessBlueprintSlice";

const tenantHeader = process.env.NEXT_PUBLIC_TENANT_ID;

export const fetchBusinessBlueprint = createAsyncThunk(
  "businessblueprint/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await fetch(`/api/platform/business-blueprint`, {
        headers: {
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to fetch theme");

      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const updateBusinessBlueprint = createAsyncThunk(
  "businessblueprint/update",
  async (payload: Partial<BusinessBlueprint>, { rejectWithValue }) => {
    try {
      const resp = await fetch(`/api/platform/business-blueprint`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": tenantHeader || "",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await resp.json();

      if (!resp.ok) throw new Error(data.error || "Failed to update theme");

      const config = data.data;

      return config;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);
