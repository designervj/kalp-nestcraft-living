import { createAsyncThunk } from "@reduxjs/toolkit";
import { BrandConfiguration } from "./brandingSlice";
import { mappedLanguages } from "@/components/admin/branding/languageMapping";

const tenantHeader = process.env.NEXT_PUBLIC_TENANT_ID;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchBrandingThunk = createAsyncThunk(
  "branding/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/admin/branding`, {
        headers: {
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to fetch branding");

      const config = data.branding;
      // Ensure basic structure exists
      if (config) {
        if (!config.languages) config.languages = { available: [], default: "" };
        if (!config.currencies) config.currencies = { available: [], default: "" };
      }

      return config;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const saveBrandingThunk = createAsyncThunk(
  "branding/save",
  async (config: BrandConfiguration, { rejectWithValue }) => {
    try {
      // Filter out disabled items before save and map to ISO 639-1
      const availableLanguages = config.languages.available
        .filter((l) => l.enabled)
        .map((l) => ({
          ...l,
          code: mappedLanguages[l.code.toLowerCase()] || l.code,
        }));

      const defaultLanguage =
        mappedLanguages[config.languages.default.toLowerCase()] ||
        config.languages.default;

      const payload = {
        ...config,
        languages: {
          ...config.languages,
          available: availableLanguages,
          default: defaultLanguage,
        },
        currencies: {
          ...config.currencies,
          available: config.currencies.available.filter((c) => c.enabled),
        },
      };

      const res = await fetch(`${API_BASE_URL}/admin/branding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-db": tenantHeader || "",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save branding");

      return payload; // Return filtered payload to sync UI
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);
